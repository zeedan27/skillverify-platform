import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto, UpdateJobDto, JobStatus, Role, TokenPayload, JobMatch } from '@skillverify/shared';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async calculateMatches(applicantSkills: string[]): Promise<JobMatch[]> {
    const activeJobs = await this.jobModel.find({ status: JobStatus.ACTIVE }).exec();
    const normalizedApplicant = (applicantSkills || []).map((s) => s.trim().toLowerCase());

    const matches: JobMatch[] = activeJobs.map((job) => {
      const required = job.requiredSkills || [];
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      for (const skill of required) {
        const trimmed = skill.trim();
        if (normalizedApplicant.includes(trimmed.toLowerCase())) {
          matchedSkills.push(trimmed);
        } else {
          missingSkills.push(trimmed);
        }
      }

      const matchPercent = required.length > 0
        ? Math.round((matchedSkills.length / required.length) * 100)
        : 100;

      return {
        jobId: job._id.toString(),
        matchPercent,
        matchedSkills,
        missingSkills,
      };
    });

    return matches.sort((a, b) => b.matchPercent - a.matchPercent);
  }

  async create(user: TokenPayload, dto: CreateJobDto, companyName: string): Promise<JobDocument> {
    const passingScore = dto.passingScore || 70;
    if (passingScore < 50 || passingScore > 100) {
      throw new BadRequestException('RULE-009: Passing score threshold must be between 50% and 100%');
    }

    const job = new this.jobModel({
      ...dto,
      employerId: user.sub,
      companyName,
      status: JobStatus.ACTIVE,
      passingScore,
    });
    return job.save();
  }

  async findAll(query?: {
    status?: JobStatus;
    search?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    skills?: string[];
  }): Promise<JobDocument[]> {
    const filter: any = {};
    if (query?.status) {
      filter.status = query.status;
    } else {
      // By default only show active jobs to public applicants
      filter.status = JobStatus.ACTIVE;
    }

    if (query?.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { companyName: { $regex: query.search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    if (query?.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }

    if (query?.minSalary !== undefined) {
      filter['salaryRange.max'] = { $gte: Number(query.minSalary) };
    }

    if (query?.maxSalary !== undefined) {
      filter['salaryRange.min'] = { $lte: Number(query.maxSalary) };
    }

    if (query?.skills && query.skills.length > 0) {
      filter.requiredSkills = { $in: query.skills.map((s) => new RegExp(s.trim(), 'i')) };
    }

    return this.jobModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByEmployer(employerId: string): Promise<JobDocument[]> {
    return this.jobModel.find({ employerId }).sort({ createdAt: -1 }).exec();
  }

  async findActiveByEmployer(employerId: string): Promise<JobDocument[]> {
    return this.jobModel.find({ employerId, status: JobStatus.ACTIVE }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<JobDocument> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${id} not found`);
    }
    return job;
  }

  async update(id: string, user: TokenPayload, dto: UpdateJobDto): Promise<JobDocument> {
    const job = await this.findById(id);
    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this job listing');
    }

    if (dto.passingScore !== undefined && (dto.passingScore < 50 || dto.passingScore > 100)) {
      throw new BadRequestException('RULE-009: Passing score threshold must be between 50% and 100%');
    }

    // Only admin can reactivate a suspended job
    if (job.status === JobStatus.SUSPENDED && dto.status === JobStatus.ACTIVE && user.role !== Role.ADMIN) {
      throw new ForbiddenException('This job is suspended by platform administration and cannot be reopened by an employer.');
    }

    const updated = await this.jobModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    return updated!;
  }

  async attachQuiz(jobId: string, quizId: string): Promise<void> {
    await this.jobModel.findByIdAndUpdate(jobId, { quizId });
  }

  async attachCourse(jobId: string, courseId: string): Promise<void> {
    await this.jobModel.findByIdAndUpdate(jobId, { courseId });
  }
}
