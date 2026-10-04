import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AdminAction } from '@skillverify/shared';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  adminId: string;

  @Prop({ required: true, type: String })
  action: AdminAction;

  @Prop({ required: true, enum: ['user', 'job', 'company', 'course', 'quiz'] })
  targetType: 'user' | 'job' | 'company' | 'course' | 'quiz';

  @Prop({ required: true })
  targetId: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ default: () => new Date().toISOString() })
  timestamp: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
