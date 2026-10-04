import { Controller, Get, Put, Post, Body, UseGuards, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, TokenPayload, ApiResponse } from '@skillverify/shared';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: TokenPayload): Promise<ApiResponse<any>> {
    const profile = await this.usersService.findById(user.sub);
    const { passwordHash, ...safeProfile } = profile.toObject();
    return {
      success: true,
      data: safeProfile,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: TokenPayload,
    @Body() updateData: any,
  ): Promise<ApiResponse<any>> {
    const allowedUpdates: Record<string, any> = {};

    if (user.role === Role.APPLICANT) {
      if (updateData.fullName !== undefined) allowedUpdates.fullName = updateData.fullName;
      if (updateData.phone !== undefined) allowedUpdates.phone = updateData.phone;
      if (updateData.headline !== undefined) allowedUpdates.headline = updateData.headline;
      if (updateData.profilePhotoUrl !== undefined) allowedUpdates.profilePhotoUrl = updateData.profilePhotoUrl;
      if (Array.isArray(updateData.skills)) allowedUpdates.skills = updateData.skills;
      if (Array.isArray(updateData.education)) allowedUpdates.education = updateData.education;
      if (Array.isArray(updateData.experience)) allowedUpdates.experience = updateData.experience;
    } else if (user.role === Role.EMPLOYER) {
      if (updateData.companyName !== undefined) allowedUpdates.companyName = updateData.companyName;
      if (updateData.companyWebsite !== undefined) allowedUpdates.companyWebsite = updateData.companyWebsite;
      if (updateData.contactPerson !== undefined) allowedUpdates.contactPerson = updateData.contactPerson;
      if (updateData.phone !== undefined) allowedUpdates.phone = updateData.phone;
      if (updateData.logoUrl !== undefined) allowedUpdates.logoUrl = updateData.logoUrl;
    } else {
      if (updateData.fullName !== undefined) allowedUpdates.fullName = updateData.fullName;
    }

    const updated = await this.usersService.updateProfile(user.sub, allowedUpdates);
    const { passwordHash, ...safeProfile } = updated.toObject();
    return {
      success: true,
      data: safeProfile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('password')
  async changePassword(
    @CurrentUser() user: TokenPayload,
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<ApiResponse<null>> {
    await this.usersService.changePassword(user.sub, body.currentPassword, body.newPassword);
    return {
      success: true,
      data: null,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('bookmarks')
  async getBookmarks(@CurrentUser() user: TokenPayload): Promise<ApiResponse<string[]>> {
    const bookmarks = await this.usersService.getBookmarks(user.sub);
    return {
      success: true,
      data: bookmarks,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('bookmarks/:jobId')
  async toggleBookmark(
    @CurrentUser() user: TokenPayload,
    @Param('jobId') jobId: string,
  ): Promise<ApiResponse<string[]>> {
    const updated = await this.usersService.toggleBookmark(user.sub, jobId);
    return {
      success: true,
      data: updated,
      message: 'Bookmark updated',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers(@Query('role') role?: Role): Promise<ApiResponse<any[]>> {
    const users = await this.usersService.findAll(role);
    const safeUsers = users.map((u) => {
      const { passwordHash, ...safe } = u.toObject();
      return safe;
    });
    return {
      success: true,
      data: safeUsers,
      timestamp: new Date().toISOString(),
    };
  }
}
