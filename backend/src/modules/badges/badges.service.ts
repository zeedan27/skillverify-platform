import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { SkillBadge, SkillBadgeDocument } from './schemas/badge.schema';
import { BadgeTier, NotificationType, VerifyBadgeResponse } from '@skillverify/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { JobsService } from '../jobs/jobs.service';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    @InjectModel(SkillBadge.name) private badgeModel: Model<SkillBadgeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jobsService: JobsService,
    private notificationsService: NotificationsService,
  ) {}

  async issueOnPass(
    applicantId: string,
    jobId: string,
    score: number,
  ): Promise<SkillBadgeDocument | null> {
    try {
      // RULE-020: Limited to one badge per (applicantId, jobId) pair
      let badge = await this.badgeModel.findOne({ applicantId, jobId }).exec();

      const job = await this.jobsService.findById(jobId).catch(() => null);
      if (!job) return null;

      const tier: BadgeTier =
        score >= 90
          ? BadgeTier.GOLD
          : score >= 80
          ? BadgeTier.SILVER
          : BadgeTier.BRONZE;

      const primarySkill =
        job.requiredSkills && job.requiredSkills.length > 0
          ? job.requiredSkills[0]
          : job.title;

      if (badge) {
        // Upgrade tier if score improved
        if (score > badge.score) {
          badge.score = score;
          badge.tier = tier;
          await badge.save();
        }
        return badge;
      }

      // Generate unique 12-character cryptographic verifyCode (RULE-020)
      const verifyCode = crypto.randomBytes(6).toString('hex').toUpperCase();

      badge = new this.badgeModel({
        applicantId,
        jobId,
        jobTitle: job.title,
        companyName: job.companyName,
        skill: primarySkill,
        tier,
        score,
        issuedAt: new Date().toISOString(),
        verifyCode,
      });

      const saved = await badge.save();

      // Emit BADGE_EARNED notification
      await this.notificationsService.notify(
        applicantId,
        NotificationType.BADGE_EARNED,
        `New Skill Badge Earned: ${tier.toUpperCase()}`,
        `You were awarded the ${tier.toUpperCase()} Skill Badge for "${job.title}" (${primarySkill}) with a score of ${score}%. Verify Code: ${verifyCode}`,
        `/profile`,
      ).catch(() => {});

      return saved;
    } catch (err: any) {
      this.logger.error(`Failed to issue badge for applicant ${applicantId}: ${err.message}`);
      return null;
    }
  }

  async getMyBadges(applicantId: string): Promise<SkillBadgeDocument[]> {
    return this.badgeModel.find({ applicantId }).sort({ createdAt: -1 }).exec();
  }

  async getBadgesForApplicant(applicantId: string): Promise<SkillBadgeDocument[]> {
    return this.badgeModel.find({ applicantId }).sort({ createdAt: -1 }).exec();
  }

  async verifyBadge(verifyCode: string): Promise<VerifyBadgeResponse> {
    const badge = await this.badgeModel.findOne({ verifyCode: verifyCode.toUpperCase().trim() }).exec();
    if (!badge) {
      return { valid: false };
    }

    const applicant = await this.userModel.findById(badge.applicantId).exec();

    return {
      valid: true,
      badge: {
        _id: badge._id.toString(),
        applicantId: badge.applicantId,
        jobId: badge.jobId,
        jobTitle: badge.jobTitle,
        companyName: badge.companyName,
        skill: badge.skill,
        tier: badge.tier,
        score: badge.score,
        issuedAt: badge.issuedAt,
        verifyCode: badge.verifyCode,
      },
      applicantName: applicant?.fullName || 'Verified Applicant',
    };
  }
}
