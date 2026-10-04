import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Role, UserStatus, ApplicantProfile, EmployerProfile } from '@skillverify/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: {
    email: string;
    password: string;
    role: Role;
    fullName?: string;
    phone?: string;
    companyName?: string;
    companyWebsite?: string;
    contactPerson?: string;
  }): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const createdUser = new this.userModel({
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      status: UserStatus.ACTIVE,
      fullName: data.fullName,
      phone: data.phone,
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      contactPerson: data.contactPerson,
      skills: [],
      education: [],
      experience: [],
    });

    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<UserDocument> {
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return updated;
  }

  async findAll(role?: Role): Promise<UserDocument[]> {
    const query = role ? { role } : {};
    return this.userModel.find(query).exec();
  }

  async updateStatus(userId: string, status: UserStatus): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: { status } }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return user;
  }

  async toggleBookmark(userId: string, jobId: string): Promise<string[]> {
    const user = await this.findById(userId);
    const bookmarks = user.bookmarkedJobIds || [];
    const exists = bookmarks.includes(jobId);
    const updatedBookmarks = exists
      ? bookmarks.filter((id) => id !== jobId)
      : [...bookmarks, jobId];

    await this.userModel.findByIdAndUpdate(userId, { $set: { bookmarkedJobIds: updatedBookmarks } });
    return updatedBookmarks;
  }

  async getBookmarks(userId: string): Promise<string[]> {
    const user = await this.findById(userId);
    return user.bookmarkedJobIds || [];
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ConflictException('Current password is incorrect');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new ConflictException('New password must be at least 6 characters long');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await this.userModel.findByIdAndUpdate(userId, { $set: { passwordHash } });
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await this.userModel.findByIdAndUpdate(userId, { $set: { passwordHash } });
  }
}
