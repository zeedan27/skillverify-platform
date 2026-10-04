import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  TokenPayload,
  ApiResponse,
  LeaderboardResponse,
  Role,
  UpdateCandidateStatusDto,
  ScheduleInterviewDto,
  SendOfferDto,
} from '@skillverify/shared';

@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':jobId')
  @UseGuards(JwtAuthGuard)
  async getLeaderboard(
    @Param('jobId') jobId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<LeaderboardResponse>> {
    const data = await this.leaderboardService.getLeaderboard(jobId, user);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':jobId/candidate/:applicantId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async updateCandidateStatus(
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateCandidateStatusDto,
  ): Promise<ApiResponse<any>> {
    const review = await this.leaderboardService.updateCandidateStatus(
      jobId,
      applicantId,
      user,
      dto,
    );
    return {
      success: true,
      data: review,
      message: `Candidate status updated to ${dto.status}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':jobId/candidate/:applicantId/review')
  @UseGuards(JwtAuthGuard)
  async getCandidateReview(
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const review = await this.leaderboardService.getCandidateReview(jobId, applicantId, user);
    return {
      success: true,
      data: review,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':jobId/candidate/:applicantId/interview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async scheduleInterview(
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: ScheduleInterviewDto,
  ): Promise<ApiResponse<any>> {
    const schedule = await this.leaderboardService.scheduleInterview(
      jobId,
      applicantId,
      user,
      dto,
    );
    return {
      success: true,
      data: schedule,
      message: 'Interview successfully scheduled and candidate notified',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':jobId/candidate/:applicantId/interview')
  @UseGuards(JwtAuthGuard)
  async getInterview(
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const schedule = await this.leaderboardService.getInterview(jobId, applicantId, user);
    return {
      success: true,
      data: schedule,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':jobId/candidate/:applicantId/offer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async sendOffer(
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: SendOfferDto,
  ): Promise<ApiResponse<any>> {
    const offer = await this.leaderboardService.sendOffer(jobId, applicantId, user, dto);
    return {
      success: true,
      data: offer,
      message: 'Employment offer extended and candidate notified',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':jobId/candidate/:applicantId/offer')
  @UseGuards(JwtAuthGuard)
  async getOffer(
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const offer = await this.leaderboardService.getOffer(jobId, applicantId, user);
    return {
      success: true,
      data: offer,
      timestamp: new Date().toISOString(),
    };
  }
}

