import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { JobStatus } from '@skillverify/shared';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  employerId: string;

  @Prop({ required: true, trim: true })
  companyName: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({
    type: {
      min: Number,
      max: Number,
      currency: String,
    },
  })
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };

  @Prop({ required: true })
  deadline: string;

  @Prop({ required: true, enum: JobStatus, default: JobStatus.ACTIVE })
  status: JobStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz' })
  quizId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  courseId?: string;

  @Prop({ default: 70, min: 50, max: 100 })
  passingScore: number;
}

export const JobSchema = SchemaFactory.createForClass(Job);
