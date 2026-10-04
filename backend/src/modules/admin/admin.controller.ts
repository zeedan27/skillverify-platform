import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, TokenPayload, ApiResponse, QuizAttemptState } from '@skillverify/shared';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== ANALYTICS & AUDIT ====================

  @Get('analytics')
  async getAnalytics(): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPlatformAnalytics();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('audit-logs')
  async getAuditLogs(): Promise<ApiResponse<any[]>> {
    const logs = await this.adminService.getAuditLogs();
    return {
      success: true,
      data: logs,
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== USER MANAGEMENT ====================

  @Post('users')
  async createUser(
    @CurrentUser() admin: TokenPayload,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const user = await this.adminService.createUser(admin, dto);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('users/:id')
  async updateUser(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const user = await this.adminService.updateUser(admin, id, dto);
    return {
      success: true,
      data: user,
      message: 'User details updated',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('users/:id/reset-password')
  async resetUserPassword(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body('newPassword') newPassword?: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.resetUserPassword(admin, id, newPassword);
    return {
      success: true,
      data: res,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('users/:id')
  async deleteUser(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.deleteUser(admin, id);
    return {
      success: true,
      data: res,
      message: 'User deleted and account deactivated',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('users/:id/suspend')
  async suspendUser(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.suspendUser(admin, id, reason);
    return {
      success: true,
      data: res,
      message: 'User account suspended',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('users/:id/restore')
  async restoreUser(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.restoreUser(admin, id);
    return {
      success: true,
      data: res,
      message: 'User account restored',
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== JOB MANAGEMENT ====================

  @Get('jobs')
  async getAllJobs(): Promise<ApiResponse<any[]>> {
    const jobs = await this.adminService.getAllJobs();
    return {
      success: true,
      data: jobs,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('jobs')
  async createJob(
    @CurrentUser() admin: TokenPayload,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const job = await this.adminService.createJob(admin, dto);
    return {
      success: true,
      data: job,
      message: 'Job circular created',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('jobs/:id')
  async updateJob(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const job = await this.adminService.updateJob(admin, id, dto);
    return {
      success: true,
      data: job,
      message: 'Job circular updated',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('jobs/:id')
  async deleteJob(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.deleteJob(admin, id);
    return {
      success: true,
      data: res,
      message: 'Job circular deleted',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('jobs/:id/suspend')
  async suspendJob(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.suspendJob(admin, id, reason);
    return {
      success: true,
      data: res,
      message: 'Job circular suspended',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('jobs/:id/restore')
  async restoreJob(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.restoreJob(admin, id);
    return {
      success: true,
      data: res,
      message: 'Job circular restored',
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== QUIZ MANAGEMENT ====================

  @Get('quizzes')
  async getAllQuizzes(): Promise<ApiResponse<any[]>> {
    const quizzes = await this.adminService.getAllQuizzes();
    return {
      success: true,
      data: quizzes,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('quizzes/:id')
  async getQuizById(@Param('id') id: string): Promise<ApiResponse<any>> {
    const quiz = await this.adminService.getQuizById(id);
    return {
      success: true,
      data: quiz,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('quizzes')
  async createQuiz(
    @CurrentUser() admin: TokenPayload,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const quiz = await this.adminService.createQuiz(admin, dto);
    return {
      success: true,
      data: quiz,
      message: 'Quiz created and attached to circular',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('quizzes/:id')
  async updateQuiz(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const quiz = await this.adminService.updateQuiz(admin, id, dto);
    return {
      success: true,
      data: quiz,
      message: 'Quiz updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('quizzes/:id')
  async deleteQuiz(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.deleteQuiz(admin, id);
    return {
      success: true,
      data: res,
      message: 'Quiz deleted',
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== COURSE MANAGEMENT ====================

  @Get('courses')
  async getAllCourses(): Promise<ApiResponse<any[]>> {
    const courses = await this.adminService.getAllCourses();
    return {
      success: true,
      data: courses,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('courses/:id')
  async getCourseById(@Param('id') id: string): Promise<ApiResponse<any>> {
    const course = await this.adminService.getCourseById(id);
    return {
      success: true,
      data: course,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('courses')
  async createCourse(
    @CurrentUser() admin: TokenPayload,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const course = await this.adminService.createCourse(admin, dto);
    return {
      success: true,
      data: course,
      message: 'Course created and attached to circular',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('courses/:id')
  async updateCourse(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body() dto: any,
  ): Promise<ApiResponse<any>> {
    const course = await this.adminService.updateCourse(admin, id, dto);
    return {
      success: true,
      data: course,
      message: 'Course updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('courses/:id')
  async deleteCourse(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.deleteCourse(admin, id);
    return {
      success: true,
      data: res,
      message: 'Course deleted',
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== ATTEMPTS & OVERRIDES ====================

  @Get('quiz-attempts')
  async getAllQuizAttempts(): Promise<ApiResponse<any[]>> {
    const attempts = await this.adminService.getAllQuizAttempts();
    return {
      success: true,
      data: attempts,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('quiz-attempt/:id/override-state')
  async overrideState(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
    @Body('state') state: QuizAttemptState,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.overrideQuizState(admin, id, state);
    return {
      success: true,
      data: res,
      message: 'Quiz attempt state overridden',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('quiz-attempt/:id')
  async deleteAttempt(
    @CurrentUser() admin: TokenPayload,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const res = await this.adminService.deleteQuizAttempt(admin, id);
    return {
      success: true,
      data: res,
      message: 'Attempt removed',
      timestamp: new Date().toISOString(),
    };
  }
}
