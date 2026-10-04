import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role, UserStatus, Education, WorkExperience } from '@skillverify/shared';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: Role, default: Role.APPLICANT })
  role: Role;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  // Applicant Profile Fields
  @Prop({ trim: true })
  fullName?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  profilePhotoUrl?: string;

  @Prop()
  headline?: string;

  @Prop({ type: [String], default: [] })
  skills?: string[];

  @Prop({ type: Array, default: [] })
  education?: Education[];

  @Prop({ type: Array, default: [] })
  experience?: WorkExperience[];

  @Prop({ type: [String], default: [] })
  bookmarkedJobIds?: string[];

  @Prop({ default: false, index: true })
  isPublic?: boolean;

  @Prop({ unique: true, sparse: true, trim: true, lowercase: true, index: true })
  publicSlug?: string;

  // Employer Profile Fields
  @Prop({ trim: true })
  companyName?: string;

  @Prop({ trim: true })
  companyWebsite?: string;

  @Prop({ trim: true })
  contactPerson?: string;

  @Prop()
  logoUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
