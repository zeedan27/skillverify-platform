import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { QuizAttemptState, IntegrityEventType } from '@skillverify/shared';

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema({ timestamps: true })
export class QuizAttempt {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  applicantId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Quiz' })
  quizId: string;

  @Prop({ required: true, enum: QuizAttemptState, default: QuizAttemptState.NOT_STARTED })
  state: QuizAttemptState;

  @Prop({
    type: [
      {
        attemptNumber: { type: Number, enum: [1, 2], required: true },
        score: { type: Number, required: true },
        submittedAt: { type: String, required: true },
        answers: { type: [MongooseSchema.Types.Mixed], required: true },
      },
    ],
    default: [],
  })
  attempts: {
    attemptNumber: 1 | 2;
    score: number;
    submittedAt: string;
    answers: (number | number[])[];
  }[];

  @Prop()
  startedAt?: string;

  @Prop({ default: 0 })
  integrityFlags?: number;

  @Prop({ type: [String], default: [] })
  servedQuestionIds?: string[];

  @Prop({ type: [[Number]], default: [] })
  optionOrders?: number[][];

  @Prop({
    type: [
      {
        type: { type: String, required: true },
        at: { type: String, required: true },
      },
    ],
    default: [],
  })
  integrityEvents?: {
    type: IntegrityEventType;
    at: string;
  }[];
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);
QuizAttemptSchema.index({ applicantId: 1, jobId: 1 }, { unique: true });
