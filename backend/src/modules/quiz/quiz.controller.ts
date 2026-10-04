import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateQuizDto,
  QuizSubmission,
  QuizResult,
  Role,
  TokenPayload,
  ApiResponse,
  RecordIntegrityEventDto,
} from '@skillverify/shared';

@Controller('api/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
  async getQuizForJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const quiz = await this.quizService.getQuizByJobId(jobId, user);
    return {
      success: true,
      data: quiz,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.APPLICANT, Role.ADMIN)
  async getMyApplications(@CurrentUser() user: TokenPayload): Promise<ApiResponse<any[]>> {
    const apps = await this.quizService.getMyApplications(user.sub);
    return {
      success: true,
      data: apps,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('attempt/:jobId')
  @UseGuards(JwtAuthGuard)
  async getMyAttempt(
    @Param('jobId') jobId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const attempt = await this.quizService.getAttemptStatus(user.sub, jobId);
    return {
      success: true,
      data: attempt,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async createQuiz(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateQuizDto,
  ): Promise<ApiResponse<any>> {
    const quiz = await this.quizService.createQuiz(user, dto);
    return {
      success: true,
      data: quiz,
      message: 'Quiz created and attached to job circular',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('start/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.APPLICANT, Role.ADMIN)
  async startQuiz(
    @Param('jobId') jobId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const attempt = await this.quizService.startQuizAttempt(user, jobId);
    return {
      success: true,
      data: {
        startedAt: attempt.startedAt,
        attemptId: attempt._id,
      },
      message: 'Assessment attempt initiated',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('integrity-event/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.APPLICANT, Role.ADMIN)
  async recordIntegrityEvent(
    @Param('jobId') jobId: string,
    @Body() dto: RecordIntegrityEventDto,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const result = await this.quizService.recordIntegrityEvent(user, jobId, dto);
    return {
      success: true,
      data: result,
      message: 'Integrity event logged',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('integrity-flag/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.APPLICANT, Role.ADMIN)
  async recordIntegrityFlag(
    @Param('jobId') jobId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<any>> {
    const result = await this.quizService.recordIntegrityFlag(user, jobId);
    return {
      success: true,
      data: result,
      message: 'Integrity flag recorded',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.APPLICANT, Role.ADMIN)
  async submitQuiz(
    @CurrentUser() user: TokenPayload,
    @Body() submission: QuizSubmission,
  ): Promise<ApiResponse<QuizResult>> {
    const result = await this.quizService.submitQuiz(user, submission);
    return {
      success: true,
      data: result,
      message: result.passed ? 'Congratulations! You passed the skill gate.' : 'Grooming course required to unlock final attempt.',
      timestamp: new Date().toISOString(),
    };
  }
}
