import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApplicationStatus } from '@skillverify/shared';

export type CandidateReviewDocument = CandidateReview & Document;

@Schema({ timestamps: true })
export class CandidateReview {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  applicantId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  employerId: string;

  @Prop({ required: true, enum: ApplicationStatus, default: ApplicationStatus.NEW })
  status: ApplicationStatus;

  @Prop()
  note?: string;

  @Prop({
    type: [
      {
        status: { type: String, enum: ApplicationStatus, required: true },
        changedAt: { type: String, required: true },
        note: { type: String },
      },
    ],
    default: [],
  })
  history: {
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }[];
}

export const CandidateReviewSchema = SchemaFactory.createForClass(CandidateReview);
CandidateReviewSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
