import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseProgress, CourseProgressDocument } from './schemas/progress.schema';
import { CourseService } from '../course/course.service';
import { MarkModuleCompleteDto, TokenPayload, NotificationType } from '@skillverify/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { gradeQuestions } from '../../common/grading';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(CourseProgress.name) private progressModel: Model<CourseProgressDocument>,
    private courseService: CourseService,
    private notificationsService: NotificationsService,
  ) {}

  async getProgress(applicantId: string, courseId: string): Promise<CourseProgressDocument> {
    let progress = await this.progressModel.findOne({ applicantId, courseId }).exec();
    if (!progress) {
      const course = await this.courseService.getCourseById(courseId);
      progress = new this.progressModel({
        applicantId,
        courseId,
        jobId: course.jobId,
        moduleProgress: course.modules.map((m) => ({
          moduleId: m._id ? m._id.toString() : m.title,
          completed: false,
          checkpointPassed: false,
        })),
        completed: false,
      });
      await progress.save();
    }
    return progress;
  }

  async markModuleComplete(user: TokenPayload, dto: MarkModuleCompleteDto): Promise<CourseProgressDocument> {
    const course = await this.courseService.getCourseById(dto.courseId);
    let progress = await this.progressModel.findOne({
      applicantId: user.sub,
      courseId: dto.courseId,
    });

    const targetModule = course.modules.find(
      (m) => (m._id ? m._id.toString() : m.title) === dto.moduleId || m.title === dto.moduleId,
    );

    // RULE-019: Checkpoint micro-quiz validation
    let checkpointPassed = true;
    if (targetModule?.checkpoint && targetModule.checkpoint.questions?.length > 0) {
      if (!dto.checkpointAnswers || dto.checkpointAnswers.length === 0) {
        throw new BadRequestException(
          'RULE-019: Checkpoint answers are required to complete this module',
        );
      }

      const gradeResult = gradeQuestions(
        targetModule.checkpoint.questions as any,
        dto.checkpointAnswers,
      );

      const minRequired = targetModule.checkpoint.minCorrect || 1;
      if (gradeResult.correctCount < minRequired) {
        throw new BadRequestException(
          `RULE-019: Checkpoint failed (${gradeResult.correctCount}/${minRequired} correct). Review module content and try again.`,
        );
      }
      checkpointPassed = true;
    }

    if (!progress) {
      progress = new this.progressModel({
        applicantId: user.sub,
        courseId: dto.courseId,
        jobId: course.jobId,
        moduleProgress: course.modules.map((m) => ({
          moduleId: m._id ? m._id.toString() : m.title,
          completed: false,
          checkpointPassed: false,
        })),
        completed: false,
      });
    }

    const modIndex = progress.moduleProgress.findIndex(
      (m) => m.moduleId === dto.moduleId || m.moduleId.toString() === dto.moduleId,
    );

    if (modIndex >= 0) {
      progress.moduleProgress[modIndex].completed = true;
      progress.moduleProgress[modIndex].checkpointPassed = checkpointPassed;
      progress.moduleProgress[modIndex].completedAt = new Date().toISOString();
    } else {
      progress.moduleProgress.push({
        moduleId: dto.moduleId,
        completed: true,
        checkpointPassed,
        completedAt: new Date().toISOString(),
      });
    }

    // Check if all modules in the course are completed
    const allCompleted = course.modules.every((cm) => {
      const cmId = cm._id ? cm._id.toString() : cm.title;
      const mp = progress!.moduleProgress.find((p) => p.moduleId === cmId);
      return mp && mp.completed;
    });

    progress.completed = allCompleted;
    if (allCompleted && !progress.completedAt) {
      progress.completedAt = new Date().toISOString();

      // Dispatch GROOMING_UNLOCKED notification
      this.notificationsService.notify(
        user.sub,
        NotificationType.GROOMING_UNLOCKED,
        'Grooming Complete!',
        `You have completed the grooming course for "${course.title}". Your final quiz attempt is now unlocked!`,
        `/job/${course.jobId}/quiz`,
      ).catch(() => {});
    }

    return progress.save();
  }

  async isGroomingCompleted(applicantId: string, jobId: string): Promise<boolean> {
    const progress = await this.progressModel.findOne({ applicantId, jobId, completed: true });
    return !!progress;
  }

  async getCompletedApplicantsForJob(jobId: string): Promise<CourseProgressDocument[]> {
    return this.progressModel.find({ jobId, completed: true }).exec();
  }
}
