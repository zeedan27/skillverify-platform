import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InterviewScheduleDocument = InterviewSchedule & Document;

@Schema({ timestamps: true })
export class InterviewSchedule {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  applicantId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  employerId: string;

  @Prop({ required: true })
  scheduledAt: string; // ISO 8601

  @Prop({ required: true, default: 45 })
  durationMins: number;

  @Prop({ required: true })
  meetingLink: string;

  @Prop()
  notes?: string;
}

export const InterviewScheduleSchema = SchemaFactory.createForClass(InterviewSchedule);
InterviewScheduleSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
