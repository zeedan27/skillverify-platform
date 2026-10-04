import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, TokenPayload, ApiResponse } from '@skillverify/shared';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async getOverview(@CurrentUser() user: TokenPayload): Promise<ApiResponse<any>> {
    const data = await this.analyticsService.getEmployerOverview(user);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('job/:jobId')
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async getJobAnalytics(
    @Param('jobId') jobId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const data = await this.analyticsService.getJobAnalytics(jobId, user);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
