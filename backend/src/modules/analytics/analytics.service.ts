import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { CourseProgress, CourseProgressDocument } from '../progress/schemas/progress.schema';
import { QuizAttemptState, Role, TokenPayload } from '@skillverify/shared';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(CourseProgress.name) private progressModel: Model<CourseProgressDocument>,
  ) {}

  async getJobAnalytics(jobId: string, user: TokenPayload): Promise<any> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job #${jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized to access analytics for this job');
    }

    const attempts = await this.attemptModel.find({ jobId }).exec();
    const progresses = await this.progressModel.find({ jobId }).exec();

    const totalApplicants = attempts.length;
    let attempt1Passed = 0;
    let attempt1Failed = 0;
    let finalPassed = 0;
    let finalFailed = 0;
    let allScores: number[] = [];

    const distribution = {
      '0-49': 0,
      '50-69': 0,
      '70-79': 0,
      '80-89': 0,
      '90-100': 0,
    };

    attempts.forEach((a) => {
      a.attempts.forEach((att) => {
        allScores.push(att.score);
        if (att.score < 50) distribution['0-49']++;
        else if (att.score < 70) distribution['50-69']++;
        else if (att.score < 80) distribution['70-79']++;
        else if (att.score < 90) distribution['80-89']++;
        else distribution['90-100']++;

        if (att.attemptNumber === 1) {
          if (att.score >= job.passingScore) attempt1Passed++;
          else attempt1Failed++;
        } else if (att.attemptNumber === 2) {
          if (att.score >= job.passingScore) finalPassed++;
          else finalFailed++;
        }
      });
    });

    const enrolledInGrooming = attempts.filter(
      (a) =>
        a.state === QuizAttemptState.GROOMING_REQUIRED ||
        a.state === QuizAttemptState.GROOMING_COMPLETE ||
        a.state === QuizAttemptState.FINAL_ATTEMPTED ||
        a.state === QuizAttemptState.FINAL_PASSED ||
        a.state === QuizAttemptState.FINAL_FAILED,
    ).length;

    const completedGrooming = progresses.filter((p) => p.completed).length;
    const totalVerified = attempt1Passed + finalPassed;
    const passRate = totalApplicants > 0 ? Math.round((totalVerified / totalApplicants) * 100) : 0;
    const averageScore =
      allScores.length > 0 ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length) : 0;

    return {
      jobId: job._id,
      jobTitle: job.title,
      passingScore: job.passingScore,
      totalApplicants,
      totalVerified,
      passRate,
      averageScore,
      funnel: {
        stage1Attempts: totalApplicants,
        stage1Passed: attempt1Passed,
        stage1Failed: attempt1Failed,
        stage2GroomingEnrolled: enrolledInGrooming,
        stage2GroomingCompleted: completedGrooming,
        stage3FinalPassed: finalPassed,
        stage3FinalFailed: finalFailed,
      },
      distribution,
    };
  }

  async getEmployerOverview(user: TokenPayload): Promise<any> {
    const jobs = await this.jobModel.find({ employerId: user.sub }).exec();
    const jobIds = jobs.map((j) => j._id);

    const attempts = await this.attemptModel.find({ jobId: { $in: jobIds } }).exec();
    const progresses = await this.progressModel.find({ jobId: { $in: jobIds } }).exec();

    let totalApplicants = attempts.length;
    let certifiedCandidates = 0;
    let inGrooming = 0;

    attempts.forEach((a) => {
      if (a.state === QuizAttemptState.PASSED || a.state === QuizAttemptState.FINAL_PASSED) {
        certifiedCandidates++;
      } else if (a.state === QuizAttemptState.GROOMING_REQUIRED) {
        inGrooming++;
      }
    });

    const totalJobs = jobs.length;
    const completedGrooming = progresses.filter((p) => p.completed).length;

    return {
      totalJobs,
      totalApplicants,
      certifiedCandidates,
      inGrooming,
      completedGrooming,
      overallConversionRate: totalApplicants > 0 ? Math.round((certifiedCandidates / totalApplicants) * 100) : 0,
      jobs: jobs.map((j) => ({
        id: j._id,
        title: j.title,
        status: j.status,
        passingScore: j.passingScore,
        deadline: j.deadline,
      })),
    };
  }
}
