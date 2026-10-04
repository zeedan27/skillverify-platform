import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { JobsService } from '../jobs/jobs.service';
import { CreateCourseDto, Role, TokenPayload } from '@skillverify/shared';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private jobsService: JobsService,
  ) {}

  async createCourse(user: TokenPayload, dto: CreateCourseDto): Promise<CourseDocument> {
    const job = await this.jobsService.findById(dto.jobId);
    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only the job poster can attach a grooming course');
    }

    let course = await this.courseModel.findOne({ jobId: dto.jobId }).exec();

    if (!course) {
      course = new this.courseModel({
        jobId: dto.jobId,
        employerId: user.sub,
        title: dto.title,
        description: dto.description,
        modules: dto.modules,
      });
    } else {
      course.title = dto.title;
      course.description = dto.description;
      course.modules = dto.modules as any;
    }

    const saved = await course.save();
    await this.jobsService.attachCourse(dto.jobId, saved._id.toString());
    return saved;
  }

  async getCourseByJobId(jobId: string): Promise<CourseDocument> {
    const course = await this.courseModel.findOne({ jobId }).exec();
    if (!course) {
      throw new NotFoundException(`No grooming course found for job #${jobId}`);
    }
    return course;
  }

  async getCourseById(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }
    return course;
  }
}
