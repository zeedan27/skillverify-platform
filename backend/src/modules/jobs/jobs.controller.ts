import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateJobDto,
  UpdateJobDto,
  Role,
  TokenPayload,
  JobStatus,
  ApiResponse,
  JobMatch,
} from '@skillverify/shared';

@Controller('api/jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('match')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.APPLICANT, Role.ADMIN)
  async getJobMatches(@CurrentUser() user: TokenPayload): Promise<ApiResponse<JobMatch[]>> {
    const profile = await this.usersService.findById(user.sub);
    const skills = profile.skills || [];
    const matches = await this.jobsService.calculateMatches(skills);
    return {
      success: true,
      data: matches,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getAllJobs(
    @Query('status') status?: JobStatus,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('minSalary') minSalary?: number,
    @Query('maxSalary') maxSalary?: number,
    @Query('skills') skills?: string,
  ): Promise<ApiResponse<any[]>> {
    const skillsList = skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    const jobs = await this.jobsService.findAll({
      status,
      search,
      location,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      skills: skillsList,
    });
    return {
      success: true,
      data: jobs,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('company/:employerId')
  async getCompanyProfile(@Param('employerId') employerId: string): Promise<ApiResponse<any>> {
    const employer = await this.usersService.findById(employerId);
    const activeJobs = await this.jobsService.findActiveByEmployer(employerId);
    return {
      success: true,
      data: {
        employerId,
        companyName: employer.companyName || 'SkillVerify Partner',
        companyWebsite: employer.companyWebsite || '',
        contactPerson: employer.contactPerson || '',
        logoUrl: employer.logoUrl || '',
        activeJobsCount: activeJobs.length,
        jobs: activeJobs,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('employer/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async getMyJobs(@CurrentUser() user: TokenPayload): Promise<ApiResponse<any[]>> {
    const jobs = await this.jobsService.findByEmployer(user.sub);
    return {
      success: true,
      data: jobs,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getJobById(@Param('id') id: string): Promise<ApiResponse<any>> {
    const job = await this.jobsService.findById(id);
    return {
      success: true,
      data: job,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async createJob(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateJobDto,
  ): Promise<ApiResponse<any>> {
    const profile = await this.usersService.findById(user.sub);
    const companyName = profile.companyName || 'SkillVerify Partner';
    const job = await this.jobsService.create(user, dto, companyName);
    return {
      success: true,
      data: job,
      message: 'Job circular created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async updateJob(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateJobDto,
  ): Promise<ApiResponse<any>> {
    const job = await this.jobsService.update(id, user, dto);
    return {
      success: true,
      data: job,
      message: 'Job circular updated successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
