import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MarkModuleCompleteDto, Role, TokenPayload, ApiResponse } from '@skillverify/shared';

@Controller('api/progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get(':courseId')
  @Roles(Role.APPLICANT, Role.ADMIN)
  async getMyProgress(
    @Param('courseId') courseId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const progress = await this.progressService.getProgress(user.sub, courseId);
    return {
      success: true,
      data: progress,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('complete-module')
  @Roles(Role.APPLICANT, Role.ADMIN)
  async markModule(
    @CurrentUser() user: TokenPayload,
    @Body() dto: MarkModuleCompleteDto,
  ): Promise<ApiResponse<any>> {
    const progress = await this.progressService.markModuleComplete(user, dto);
    return {
      success: true,
      data: progress,
      message: progress.completed ? 'Grooming course 100% complete! Final quiz attempt unlocked.' : 'Module marked as completed.',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('job/:jobId/completed')
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async getCompletedByJob(@Param('jobId') jobId: string): Promise<ApiResponse<any[]>> {
    const completed = await this.progressService.getCompletedApplicantsForJob(jobId);
    return {
      success: true,
      data: completed,
      timestamp: new Date().toISOString(),
    };
  }
}
