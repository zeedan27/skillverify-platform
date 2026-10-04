import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationType, AppNotification } from '@skillverify/shared';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async notify(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    link?: string,
  ): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId,
      recipientId: userId,
      type,
      title,
      body,
      message: body,
      link,
      read: false,
    });

    const saved = await notification.save();
    this.logger.log(`[Notification ${type}] Dispatched to user ${userId}: "${title}" - ${body}`);
    return saved;
  }

  // Compatibility wrapper
  async createNotification(
    recipientId: string,
    title: string,
    message: string,
    type: any = NotificationType.QUIZ_RESULT,
    link?: string,
  ): Promise<NotificationDocument> {
    let resolvedType = NotificationType.QUIZ_RESULT;
    if (Object.values(NotificationType).includes(type)) {
      resolvedType = type;
    } else if (type === 'grooming') {
      resolvedType = NotificationType.GROOMING_UNLOCKED;
    }
    return this.notify(recipientId, resolvedType, title, message, link);
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: any[]; total: number; unreadCount: number; page: number; totalPages: number }> {
    const filter = {
      $or: [{ userId }, { recipientId: userId }],
    };

    const skip = (page - 1) * limit;

    const [docs, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments(filter).exec(),
      this.notificationModel.countDocuments({ ...filter, read: false }).exec(),
    ]);

    const notifications: AppNotification[] = docs.map((doc: any) => ({
      _id: doc._id.toString(),
      userId: doc.userId || doc.recipientId,
      type: doc.type,
      title: doc.title,
      body: doc.body || doc.message || '',
      link: doc.link,
      read: doc.read,
      createdAt: doc.createdAt?.toISOString?.() || new Date(doc.createdAt).toISOString(),
    }));

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const filter = {
      $or: [{ userId }, { recipientId: userId }],
      read: false,
    };
    return this.notificationModel.countDocuments(filter).exec();
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument | null> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // RULE-016: Notifications are strictly private; only readable and markable by their owner (userId)
    const ownerId = notification.userId || notification.recipientId;
    if (ownerId?.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }

    notification.read = true;
    return notification.save();
  }

  async markAllAsRead(userId: string): Promise<{ marked: number }> {
    const result = await this.notificationModel
      .updateMany(
        { $or: [{ userId }, { recipientId: userId }], read: false },
        { $set: { read: true } },
      )
      .exec();

    return { marked: result.modifiedCount };
  }
}
