import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TokenPayload, SendMessageDto, ApiResponse } from '@skillverify/shared';

@Controller('api/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @CurrentUser() user: TokenPayload,
    @Body() dto: SendMessageDto,
  ): Promise<ApiResponse<any>> {
    const msg = await this.messagesService.sendMessage(user, dto);
    return {
      success: true,
      data: msg,
      message: 'Message delivered',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('thread/:jobId/:partnerId')
  async getThread(
    @CurrentUser() user: TokenPayload,
    @Param('jobId') jobId: string,
    @Param('partnerId') partnerId: string,
  ): Promise<ApiResponse<any[]>> {
    const thread = await this.messagesService.getThread(user, jobId, partnerId);
    return {
      success: true,
      data: thread,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('read/:jobId/:senderId')
  async markAsRead(
    @CurrentUser() user: TokenPayload,
    @Param('jobId') jobId: string,
    @Param('senderId') senderId: string,
  ): Promise<ApiResponse<null>> {
    await this.messagesService.markThreadAsRead(user, jobId, senderId);
    return {
      success: true,
      data: null,
      message: 'Thread marked as read',
      timestamp: new Date().toISOString(),
    };
  }
}
