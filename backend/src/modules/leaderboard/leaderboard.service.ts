import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CourseProgress, CourseProgressDocument } from '../progress/schemas/progress.schema';
import { CandidateReview, CandidateReviewDocument } from './schemas/candidate-review.schema';
import { InterviewSchedule, InterviewScheduleDocument } from './schemas/interview-schedule.schema';
import { OfferLetter, OfferLetterDocument } from './schemas/offer-letter.schema';
import {
  LeaderboardResponse,
  LeaderboardEntry,
  QuizAttemptState,
  TokenPayload,
  Role,
  ApplicationStatus,
  UpdateCandidateStatusDto,
  NotificationType,
  ScheduleInterviewDto,
  SendOfferDto,
} from '@skillverify/shared';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CourseProgress.name) private progressModel: Model<CourseProgressDocument>,
    @InjectModel(CandidateReview.name) private candidateReviewModel: Model<CandidateReviewDocument>,
    @InjectModel(InterviewSchedule.name) private interviewModel: Model<InterviewScheduleDocument>,
    @InjectModel(OfferLetter.name) private offerModel: Model<OfferLetterDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async getLeaderboard(jobId: string, user: TokenPayload): Promise<LeaderboardResponse> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    // Only get applicants who passed the skill verification (attempt 1 or attempt 2)
    const passedAttempts = await this.attemptModel
      .find({
        jobId,
        state: { $in: [QuizAttemptState.PASSED, QuizAttemptState.FINAL_PASSED] },
      })
      .exec();

    // Sort by best score descending, then by earliest passedAt timestamp
    const scoredList = await Promise.all(
      passedAttempts.map(async (att) => {
        const applicant = await this.userModel.findById(att.applicantId).exec();
        const latestAttempt = att.attempts[att.attempts.length - 1];
        const progress = await this.progressModel.findOne({
          applicantId: att.applicantId,
          jobId,
        });

        const review = await this.candidateReviewModel.findOne({
          jobId,
          applicantId: att.applicantId,
        }).exec();

        const fallbackTime = (att as any).updatedAt
          ? (att as any).updatedAt.toISOString()
          : new Date().toISOString();

        return {
          applicantId: att.applicantId.toString(),
          fullName: applicant?.fullName || 'Verified Applicant',
          score: latestAttempt?.score || 0,
          attemptNumber: latestAttempt?.attemptNumber || 1,
          completedGrooming: progress?.completed || false,
          passedAt: latestAttempt?.submittedAt || fallbackTime,
          applicationStatus: review ? review.status : ApplicationStatus.NEW,
          integrityFlags: att.integrityFlags || 0,
          integrityEvents: att.integrityEvents || [],
        };
      }),
    );

    scoredList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.passedAt).getTime() - new Date(b.passedAt).getTime();
    });

    const entries: LeaderboardEntry[] = scoredList.map((item, index) => ({
      rank: index + 1,
      applicantId: item.applicantId,
      fullName: item.fullName,
      score: item.score,
      attemptNumber: item.attemptNumber as 1 | 2,
      completedGrooming: item.completedGrooming,
      passedAt: item.passedAt,
      applicationStatus: item.applicationStatus,
      integrityFlags: item.integrityFlags,
      integrityEvents: item.integrityEvents,
      cvUrl: `/api/cv/candidate/${item.applicantId}`,
    }));

    const response: LeaderboardResponse = {
      jobId: job._id.toString(),
      jobTitle: job.title,
      companyName: job.companyName,
      totalCandidates: entries.length,
      entries: [],
    };

    // RULE-006: Applicants viewing leaderboard see ONLY their own rank and score
    if (user.role === Role.APPLICANT) {
      const myEntry = entries.find((e) => e.applicantId === user.sub);
      if (myEntry) {
        response.selfEntry = {
          rank: myEntry.rank,
          applicantId: myEntry.applicantId,
          fullName: myEntry.fullName,
          score: myEntry.score,
          attemptNumber: myEntry.attemptNumber,
          completedGrooming: myEntry.completedGrooming,
          passedAt: myEntry.passedAt,
          applicationStatus: myEntry.applicationStatus,
          integrityFlags: myEntry.integrityFlags,
        };
      }
      response.entries = []; // Hide all other applicants
    } else {
      // Employer and Admin see full ranked candidates
      response.entries = entries;
    }

    return response;
  }

  async updateCandidateStatus(
    jobId: string,
    applicantId: string,
    user: TokenPayload,
    dto: UpdateCandidateStatusDto,
  ): Promise<CandidateReviewDocument> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only the employer who posted this circular can update candidate status',
      );
    }

    let review = await this.candidateReviewModel.findOne({ jobId, applicantId }).exec();
    const now = new Date().toISOString();

    if (!review) {
      review = new this.candidateReviewModel({
        jobId,
        applicantId,
        employerId: job.employerId.toString(),
        status: dto.status,
        note: dto.note,
        history: [
          {
            status: dto.status,
            changedAt: now,
            note: dto.note,
          },
        ],
      });
    } else {
      review.status = dto.status;
      if (dto.note !== undefined) {
        review.note = dto.note;
      }
      review.history.push({
        status: dto.status,
        changedAt: now,
        note: dto.note,
      });
    }

    const saved = await review.save();

    // Dispatch STATUS_CHANGED notification to candidate
    this.notificationsService.notify(
      applicantId,
      NotificationType.STATUS_CHANGED,
      `Application Status: ${dto.status.toUpperCase()}`,
      dto.messageToCandidate ||
        `Your application status for "${job.title}" has been updated to "${dto.status}".`,
      `/applicant/applications`,
    ).catch(() => {});

    return saved;
  }

  async getCandidateReview(
    jobId: string,
    applicantId: string,
    user: TokenPayload,
  ): Promise<CandidateReviewDocument | null> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.sub !== applicantId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Unauthorized to view this candidate review');
    }

    return this.candidateReviewModel.findOne({ jobId, applicantId }).exec();
  }

  async scheduleInterview(
    jobId: string,
    applicantId: string,
    user: TokenPayload,
    dto: ScheduleInterviewDto,
  ): Promise<InterviewScheduleDocument> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only the employer who posted this circular can schedule interviews');
    }

    // RULE-013 & RULE-022: Verify candidate attained PASSED or FINAL_PASSED
    const attempt = await this.attemptModel
      .findOne({
        jobId,
        applicantId,
        state: { $in: [QuizAttemptState.PASSED, QuizAttemptState.FINAL_PASSED] },
      })
      .exec();

    if (!attempt) {
      throw new ForbiddenException(
        'RULE-022: Interviews can only be scheduled for candidates who have passed the role assessment.',
      );
    }

    let schedule = await this.interviewModel.findOne({ jobId, applicantId }).exec();
    if (!schedule) {
      schedule = new this.interviewModel({
        jobId,
        applicantId,
        employerId: job.employerId.toString(),
        scheduledAt: dto.scheduledAt,
        durationMins: dto.durationMins || 45,
        meetingLink: dto.meetingLink,
        notes: dto.notes,
      });
    } else {
      schedule.scheduledAt = dto.scheduledAt;
      schedule.durationMins = dto.durationMins || 45;
      schedule.meetingLink = dto.meetingLink;
      schedule.notes = dto.notes;
    }

    const saved = await schedule.save();

    // Auto-update status to INTERVIEW
    await this.updateCandidateStatus(jobId, applicantId, user, {
      status: ApplicationStatus.INTERVIEW,
      note: `Interview scheduled: ${new Date(dto.scheduledAt).toLocaleString()}`,
      messageToCandidate: `An interview has been scheduled for "${job.title}" on ${new Date(
        dto.scheduledAt,
      ).toLocaleString()}. Meeting link: ${dto.meetingLink}`,
    });

    // Notify candidate
    this.notificationsService
      .notify(
        applicantId,
        NotificationType.INTERVIEW_SCHEDULED,
        `Interview Scheduled: ${job.title}`,
        `Your interview with ${job.companyName} is scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`,
        `/my-applications`,
      )
      .catch(() => {});

    return saved;
  }

  async getInterview(
    jobId: string,
    applicantId: string,
    user: TokenPayload,
  ): Promise<InterviewScheduleDocument | null> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.sub !== applicantId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Unauthorized to view interview schedule');
    }

    return this.interviewModel.findOne({ jobId, applicantId }).exec();
  }

  async sendOffer(
    jobId: string,
    applicantId: string,
    user: TokenPayload,
    dto: SendOfferDto,
  ): Promise<OfferLetterDocument> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only the employer who posted this circular can issue offers');
    }

    // RULE-013 & RULE-022: Candidate must have passed assessment
    const attempt = await this.attemptModel
      .findOne({
        jobId,
        applicantId,
        state: { $in: [QuizAttemptState.PASSED, QuizAttemptState.FINAL_PASSED] },
      })
      .exec();

    if (!attempt) {
      throw new ForbiddenException(
        'RULE-022: Offers may only be issued to candidates who have passed the role assessment.',
      );
    }

    let offer = await this.offerModel.findOne({ jobId, applicantId }).exec();
    if (!offer) {
      offer = new this.offerModel({
        jobId,
        applicantId,
        employerId: job.employerId.toString(),
        salary: dto.salary,
        startDate: dto.startDate,
        terms: dto.terms,
      });
    } else {
      offer.salary = dto.salary;
      offer.startDate = dto.startDate;
      offer.terms = dto.terms;
    }

    const saved = await offer.save();

    // Auto-update candidate status to OFFERED
    await this.updateCandidateStatus(jobId, applicantId, user, {
      status: ApplicationStatus.OFFERED,
      note: `Offer extended: ${dto.salary.amount} ${dto.salary.currency}, starting ${new Date(dto.startDate).toLocaleDateString()}`,
      messageToCandidate: `Congratulations! An official employment offer has been extended for "${job.title}".`,
    });

    // Notify candidate
    this.notificationsService
      .notify(
        applicantId,
        NotificationType.OFFER_SENT,
        `Job Offer Extended: ${job.title}! 🎉`,
        `Congratulations! ${job.companyName} has extended an official job offer starting ${new Date(dto.startDate).toLocaleDateString()}.`,
        `/my-applications`,
      )
      .catch(() => {});

    return saved;
  }

  async getOffer(
    jobId: string,
    applicantId: string,
    user: TokenPayload,
  ): Promise<OfferLetterDocument | null> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.sub !== applicantId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Unauthorized to view offer letter');
    }

    return this.offerModel.findOne({ jobId, applicantId }).exec();
  }
}
