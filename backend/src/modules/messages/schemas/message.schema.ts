import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  senderId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  recipientId: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true, default: false })
  read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ jobId: 1, senderId: 1, recipientId: 1, createdAt: 1 });
MessageSchema.index({ recipientId: 1, read: 1 });
