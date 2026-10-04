import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CourseModule } from '@skillverify/shared';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  employerId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ['video', 'text', 'file'], required: true },
        order: { type: Number, required: true },
        content: {
          text: String,
          fileUrl: String,
          fileName: String,
          durationSeconds: Number,
        },
        checkpoint: {
          questions: [
            {
              text: { type: String, required: true },
              options: { type: [String], required: true },
              correctIndex: { type: Number },
              correctIndices: { type: [Number] },
              isMultiple: { type: Boolean, default: false },
              explanation: { type: String },
            },
          ],
          minCorrect: { type: Number, default: 1 },
        },
      },
    ],
    default: [],
  })
  modules: CourseModule[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
