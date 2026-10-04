import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { NotificationsService } from '../notifications/notifications.service';
import {
  TokenPayload,
  Role,
  SendMessageDto,
  NotificationType,
  QuizAttemptState,
} from '@skillverify/shared';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
    private notificationsService: NotificationsService,
  ) {}

  private async verifyMessagingEligibility(
    jobId: string,
    applicantId: string,
    employerId: string,
  ): Promise<void> {
    const attempt = await this.attemptModel
      .findOne({
        jobId,
        applicantId,
        state: { $in: [QuizAttemptState.PASSED, QuizAttemptState.FINAL_PASSED] },
      })
      .exec();

    if (!attempt) {
      throw new ForbiddenException(
        'RULE-021: Direct messaging is strictly restricted between an employer and applicants who have attained PASSED or FINAL_PASSED for that specific job.',
      );
    }
  }

  async sendMessage(sender: TokenPayload, dto: SendMessageDto): Promise<MessageDocument> {
    if (!dto.body || !dto.body.trim()) {
      throw new BadRequestException('Message body cannot be empty');
    }

    const job = await this.jobModel.findById(dto.jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${dto.jobId} not found`);
    }

    const jobEmployerId = job.employerId.toString();

    // Verify RULE-021 based on who is sending
    if (sender.role === Role.EMPLOYER) {
      if (jobEmployerId !== sender.sub) {
        throw new ForbiddenException('You can only message candidates for circulars posted by your company');
      }
      await this.verifyMessagingEligibility(dto.jobId, dto.recipientId, sender.sub);
    } else if (sender.role === Role.APPLICANT) {
      if (dto.recipientId !== jobEmployerId) {
        throw new ForbiddenException('Applicants can only message the employer who owns the circular');
      }
      await this.verifyMessagingEligibility(dto.jobId, sender.sub, jobEmployerId);
    }

    const message = new this.messageModel({
      jobId: dto.jobId,
      senderId: sender.sub,
      recipientId: dto.recipientId,
      body: dto.body.trim(),
      read: false,
    });

    const saved = await message.save();

    // Notify recipient
    const preview = dto.body.length > 60 ? `${dto.body.substring(0, 60)}...` : dto.body;
    const link =
      sender.role === Role.EMPLOYER
        ? `/my-applications`
        : `/employer/jobs/${dto.jobId}/leaderboard`;

    this.notificationsService
      .notify(
        dto.recipientId,
        NotificationType.MESSAGE_RECEIVED,
        `New Message: ${job.title}`,
        preview,
        link,
      )
      .catch(() => {});

    return saved;
  }

  async getThread(user: TokenPayload, jobId: string, partnerId: string): Promise<MessageDocument[]> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${jobId} not found`);
    }

    // Verify participant authorization
    const isEmployer = user.sub === job.employerId.toString();
    const isApplicant = user.sub === partnerId || partnerId === job.employerId.toString();

    if (!isEmployer && user.sub !== partnerId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to view this message thread');
    }

    return this.messageModel
      .find({
        jobId,
        $or: [
          { senderId: user.sub, recipientId: partnerId },
          { senderId: partnerId, recipientId: user.sub },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async markThreadAsRead(user: TokenPayload, jobId: string, senderId: string): Promise<void> {
    await this.messageModel
      .updateMany(
        {
          jobId,
          recipientId: user.sub,
          senderId,
          read: false,
        },
        { $set: { read: true } },
      )
      .exec();
  }
}
