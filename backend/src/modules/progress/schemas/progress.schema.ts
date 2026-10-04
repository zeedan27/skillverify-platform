import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ModuleProgress } from '@skillverify/shared';

export type CourseProgressDocument = CourseProgress & Document;

@Schema({ timestamps: true })
export class CourseProgress {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  applicantId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  courseId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({
    type: [
      {
        moduleId: { type: String, required: true },
        completed: { type: Boolean, default: false },
        checkpointPassed: { type: Boolean, default: false },
        completedAt: String,
      },
    ],
    default: [],
  })
  moduleProgress: ModuleProgress[];

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  completedAt?: string;
}

export const CourseProgressSchema = SchemaFactory.createForClass(CourseProgress);
CourseProgressSchema.index({ applicantId: 1, courseId: 1 }, { unique: true });
