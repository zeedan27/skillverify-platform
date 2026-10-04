import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { StorageService } from '../storage/storage.service';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { CVTemplateData, CVResponse, QuizAttemptState, TokenPayload, Role } from '@skillverify/shared';
import { BadgesService } from '../badges/badges.service';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CVService {
  private readonly logger = new Logger(CVService.name);
  private templateFn: handlebars.TemplateDelegate | null = null;

  constructor(
    private usersService: UsersService,
    private storageService: StorageService,
    private badgesService: BadgesService,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {
    this.initTemplate();
  }

  private initTemplate() {
    try {
      const templatePath = path.resolve(__dirname, 'templates/cv-template.hbs');
      if (fs.existsSync(templatePath)) {
        const source = fs.readFileSync(templatePath, 'utf8');
        this.templateFn = handlebars.compile(source);
      }
    } catch (err: any) {
      this.logger.warn(`Could not load template file: ${err.message}`);
    }
  }

  async verifyCandidateAccess(user: TokenPayload, applicantId: string): Promise<void> {
    if (user.role === Role.ADMIN) return;

    // RULE-013: Employers can only access CVs of candidates who passed their jobs
    const employerJobs = await this.jobModel.find({ employerId: user.sub }).select('_id').exec();
    const jobIds = employerJobs.map((j) => j._id.toString());

    if (jobIds.length === 0) {
      throw new ForbiddenException('RULE-013: You do not have permission to access this candidate CV.');
    }

    const hasPassed = await this.attemptModel.exists({
      applicantId,
      jobId: { $in: jobIds },
      state: { $in: [QuizAttemptState.PASSED, QuizAttemptState.FINAL_PASSED] },
    });

    if (!hasPassed) {
      throw new ForbiddenException('RULE-013: Candidate has not passed a skill verification for any of your jobs.');
    }
  }

  async buildCVData(applicantId: string): Promise<CVTemplateData> {
    const user = await this.usersService.findById(applicantId);

    // Fetch verified quiz scores
    const attempts = await this.attemptModel
      .find({
        applicantId,
        state: { $in: [QuizAttemptState.PASSED, QuizAttemptState.FINAL_PASSED] },
      })
      .exec();

    const quizScores = await Promise.all(
      attempts.map(async (att) => {
        const job = await this.jobModel.findById(att.jobId).exec();
        const latestAttempt = att.attempts[att.attempts.length - 1];
        return {
          jobTitle: job ? job.title : 'Role Verification',
          companyName: job ? job.companyName : 'SkillVerify Partner',
          score: latestAttempt ? latestAttempt.score : 100,
          passedAt: latestAttempt ? latestAttempt.submittedAt : new Date().toISOString(),
        };
      }),
    );

    const badges = await this.badgesService.getMyBadges(applicantId).catch(() => []);

    return {
      fullName: user.fullName || user.email.split('@')[0],
      email: user.email,
      phone: user.phone || 'N/A',
      headline: user.headline || 'Verified Candidate',
      profilePhotoUrl: user.profilePhotoUrl,
      skills: user.skills || [],
      education: user.education || [],
      experience: user.experience || [],
      quizScores,
      badges: badges.map((b) => ({
        skill: b.skill,
        tier: b.tier,
        score: b.score,
        verifyCode: b.verifyCode,
        jobTitle: b.jobTitle,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  async renderPdf(applicantId: string): Promise<{ buffer: Buffer; fileName: string }> {
    const cvData = await this.buildCVData(applicantId);

    if (!this.templateFn) {
      this.initTemplate();
    }

    const html = this.templateFn
      ? this.templateFn(cvData)
      : `<h1>${cvData.fullName}</h1><p>Email: ${cvData.email}</p>`;

    let pdfBuffer: Buffer;
    try {
      // SOP-002: Puppeteer launch with sandbox flags
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const rawPdf = await page.pdf({ format: 'A4', printBackground: true });
      pdfBuffer = Buffer.from(rawPdf);
      await browser.close();
    } catch (err: any) {
      this.logger.warn(`Puppeteer generation failed: ${err.message}.`);
      throw new Error('Failed to generate PDF document');
    }

    const safeName = (cvData.fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeName}_SkillVerify_CV.pdf`;

    return { buffer: pdfBuffer, fileName };
  }

  async generateCV(applicantId: string): Promise<CVResponse> {
    const cvData = await this.buildCVData(applicantId);
    const { buffer } = await this.renderPdf(applicantId);

    const destination = `cvs/${applicantId}/cv_${Date.now()}.pdf`;
    const downloadUrl = await this.storageService.uploadFile(
      buffer,
      destination,
      'application/pdf',
    );

    return {
      downloadUrl,
      generatedAt: cvData.generatedAt,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }
}
