import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OfferLetterDocument = OfferLetter & Document;

@Schema({ _id: false })
export class OfferSalary {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;
}

@Schema({ timestamps: true })
export class OfferLetter {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Job' })
  jobId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  applicantId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  employerId: string;

  @Prop({ required: true, type: OfferSalary })
  salary: OfferSalary;

  @Prop({ required: true })
  startDate: string; // ISO 8601

  @Prop()
  terms?: string;

  @Prop()
  pdfUrl?: string;
}

export const OfferLetterSchema = SchemaFactory.createForClass(OfferLetter);
OfferLetterSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
