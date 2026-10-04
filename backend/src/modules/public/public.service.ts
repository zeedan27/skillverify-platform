import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { BadgesService } from '../badges/badges.service';
import {
  PublicPortfolio,
  CVQuizScore,
  QuizAttemptState,
  UserStatus,
  VerifyBadgeResponse,
} from '@skillverify/shared';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private badgesService: BadgesService,
  ) {}

  async getPublicPortfolio(slug: string): Promise<PublicPortfolio> {
    const user = await this.userModel
      .findOne({
        publicSlug: slug.toLowerCase().trim(),
        isPublic: true,
        status: UserStatus.ACTIVE,
      })
      .exec();

    if (!user) {
      throw new NotFoundException('Public portfolio not found or is marked as private');
    }

    const applicantId = user._id.toString();

    // Fetch verified badges
    const badgeDocs = await this.badgesService.getMyBadges(applicantId).catch(() => []);
    const badges = badgeDocs.map((b: any) => ({
      _id: b._id.toString(),
      applicantId: b.applicantId,
      jobId: b.jobId,
      jobTitle: b.jobTitle,
      companyName: b.companyName,
      skill: b.skill,
      tier: b.tier,
      score: b.score,
      issuedAt: b.issuedAt,
      verifyCode: b.verifyCode,
    }));

    // Fetch verified quiz attempts
    const attempts = await this.attemptModel
      .find({
        applicantId,
        state: { $in: [QuizAttemptState.PASSED, QuizAttemptState.FINAL_PASSED] },
      })
      .exec();

    const verifiedScores: CVQuizScore[] = await Promise.all(
      attempts.map(async (att) => {
        const job = await this.jobModel.findById(att.jobId).exec();
        const latest = att.attempts[att.attempts.length - 1];
        return {
          jobTitle: job?.title || 'Certified Role',
          companyName: job?.companyName || 'Verified Partner',
          score: latest?.score || 0,
          passedAt: latest?.submittedAt || (att as any).updatedAt?.toISOString() || new Date().toISOString(),
        };
      }),
    );

    // RULE-023: Public portfolio view (/verify/:slug) only reveals opt-in verified credentials
    // and MUST NEVER expose private applicant contact details (email, phone)
    return {
      fullName: user.fullName || 'Verified Applicant',
      headline: user.headline || '',
      skills: user.skills || [],
      badges,
      verifiedScores,
    };
  }

  async verifyBadge(code: string): Promise<VerifyBadgeResponse> {
    return this.badgesService.verifyBadge(code);
  }
}
