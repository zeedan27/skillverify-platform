import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { QuizQuestion } from '@skillverify/shared';

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  employerId: string;

  @Prop({
    type: [
      {
        text: { type: String, required: true },
        options: { type: [String], required: true },
        correctIndex: { type: Number },
        correctIndices: { type: [Number] },
        isMultiple: { type: Boolean, default: false },
        explanation: { type: String },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
      },
    ],
    required: true,
  })
  questions: QuizQuestion[];

  @Prop({ default: 70 })
  passingScore: number;

  @Prop()
  timeLimit?: number; // In minutes

  @Prop()
  poolSize?: number;

  @Prop()
  deliverCount?: number;

  @Prop({ default: false })
  shuffleOptions?: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
