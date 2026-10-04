import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BadgeTier } from '@skillverify/shared';

export type SkillBadgeDocument = SkillBadge & Document;

@Schema({ timestamps: true })
export class SkillBadge {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  applicantId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job', index: true })
  jobId: string;

  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  skill: string;

  @Prop({ required: true, enum: BadgeTier, default: BadgeTier.BRONZE })
  tier: BadgeTier;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  issuedAt: string;

  @Prop({ required: true, unique: true, index: true })
  verifyCode: string;
}

export const SkillBadgeSchema = SchemaFactory.createForClass(SkillBadge);
SkillBadgeSchema.index({ applicantId: 1, jobId: 1 }, { unique: true });
