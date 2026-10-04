import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCourseDto, Role, TokenPayload, ApiResponse } from '@skillverify/shared';

@Controller('api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
  async getCourseForJob(@Param('jobId') jobId: string): Promise<ApiResponse<any>> {
    const course = await this.courseService.getCourseByJobId(jobId);
    return {
      success: true,
      data: course,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async createCourse(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateCourseDto,
  ): Promise<ApiResponse<any>> {
    const course = await this.courseService.createCourse(user, dto);
    return {
      success: true,
      data: course,
      message: 'Grooming course created and attached to job',
      timestamp: new Date().toISOString(),
    };
  }
}
