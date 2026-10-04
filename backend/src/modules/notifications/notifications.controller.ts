import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TokenPayload, ApiResponse } from '@skillverify/shared';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: TokenPayload): Promise<ApiResponse<{ unreadCount: number }>> {
    const unreadCount = await this.notificationsService.getUnreadCount(user.sub);
    return {
      success: true,
      data: { unreadCount },
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getMyNotifications(
    @CurrentUser() user: TokenPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<any>> {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const data = await this.notificationsService.getUserNotifications(user.sub, pageNum, limitNum);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/read')
  async markRead(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const updated = await this.notificationsService.markAsRead(id, user.sub);
    return {
      success: true,
      data: updated,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: TokenPayload): Promise<ApiResponse<any>> {
    const result = await this.notificationsService.markAllAsRead(user.sub);
    return {
      success: true,
      data: result,
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString(),
    };
  }
}
