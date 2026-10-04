import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { Course, CourseDocument } from '../course/schemas/course.schema';
import { Quiz, QuizDocument } from '../quiz/schemas/quiz.schema';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { CandidateReview, CandidateReviewDocument } from '../leaderboard/schemas/candidate-review.schema';
import { CourseProgress, CourseProgressDocument } from '../progress/schemas/progress.schema';
import {
  AdminAction,
  TokenPayload,
  UserStatus,
  JobStatus,
  QuizAttemptState,
  Role,
  ApplicationStatus,
} from '@skillverify/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(CandidateReview.name) private candidateReviewModel: Model<CandidateReviewDocument>,
    @InjectModel(CourseProgress.name) private progressModel: Model<CourseProgressDocument>,
  ) {}

  private async recordAudit(
    adminId: string,
    action: AdminAction,
    targetType: 'user' | 'job' | 'company' | 'course' | 'quiz',
    targetId: string,
    metadata?: Record<string, unknown>,
  ) {
    const log = new this.auditModel({
      adminId,
      action,
      targetType,
      targetId,
      metadata,
      timestamp: new Date().toISOString(),
    });
    return log.save();
  }

  // ==================== USER MANAGEMENT ====================

  async createUser(admin: TokenPayload, dto: any) {
    const email = (dto.email || '').trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password || 'Password123!', salt);

    const newUser = new this.userModel({
      email,
      passwordHash,
      role: dto.role || Role.APPLICANT,
      status: dto.status || UserStatus.ACTIVE,
      fullName: dto.fullName,
      phone: dto.phone,
      companyName: dto.companyName,
      companyWebsite: dto.companyWebsite,
      contactPerson: dto.contactPerson,
      headline: dto.headline,
      skills: dto.skills || [],
    });

    const saved = await newUser.save();
    const { passwordHash: _, ...safeUser } = saved.toObject();

    await this.recordAudit(admin.sub, 'RESTORE_USER', 'user', saved._id.toString(), {
      action: 'ADMIN_CREATE_USER',
      email,
      role: dto.role,
    });

    return safeUser;
  }

  async updateUser(admin: TokenPayload, userId: string, updateData: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    if (updateData.email) {
      const email = updateData.email.trim().toLowerCase();
      const existing = await this.userModel.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        throw new ConflictException(`Email ${email} is already in use by another account`);
      }
      user.email = email;
    }

    const fields = [
      'fullName',
      'phone',
      'companyName',
      'companyWebsite',
      'contactPerson',
      'headline',
      'skills',
      'role',
      'status',
    ];

    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        (user as any)[field] = updateData[field];
      }
    });

    const updated = await user.save();
    const { passwordHash, ...safeUser } = updated.toObject();

    await this.recordAudit(admin.sub, 'RESTORE_USER', 'user', userId, {
      action: 'ADMIN_UPDATE_USER',
      updatedFields: Object.keys(updateData),
    });

    return safeUser;
  }

  async resetUserPassword(admin: TokenPayload, userId: string, newPassword?: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    const passwordToSet = newPassword || 'Password123!';
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(passwordToSet, salt);
    await user.save();

    await this.recordAudit(admin.sub, 'RESTORE_USER', 'user', userId, {
      action: 'ADMIN_RESET_PASSWORD',
    });

    return { message: 'Password has been reset successfully', newPassword: passwordToSet };
  }

  async deleteUser(admin: TokenPayload, userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.DELETED },
      { new: true },
    );
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    await this.recordAudit(admin.sub, 'DELETE_USER', 'user', userId);
    return { success: true, message: 'User deleted and access revoked (RULE-007)' };
  }

  async suspendUser(admin: TokenPayload, userId: string, reason?: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.SUSPENDED },
      { new: true },
    );
    if (!user) throw new NotFoundException(`User #${userId} not found`);
    await this.recordAudit(admin.sub, 'SUSPEND_USER', 'user', userId, { reason });
    return user;
  }

  async restoreUser(admin: TokenPayload, userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.ACTIVE },
      { new: true },
    );
    if (!user) throw new NotFoundException(`User #${userId} not found`);
    await this.recordAudit(admin.sub, 'RESTORE_USER', 'user', userId);
    return user;
  }

  // ==================== JOB MANAGEMENT ====================

  async getAllJobs() {
    return this.jobModel.find().sort({ createdAt: -1 }).exec();
  }

  async createJob(admin: TokenPayload, dto: any) {
    let employerId = dto.employerId || admin.sub;
    let companyName = dto.companyName;

    if (!companyName) {
      const employer = await this.userModel.findById(employerId);
      companyName = employer?.companyName || 'SkillVerify Platform';
    }

    const job = new this.jobModel({
      employerId,
      companyName,
      title: dto.title,
      description: dto.description,
      requiredSkills: dto.requiredSkills || [],
      location: dto.location,
      salaryRange: dto.salaryRange,
      deadline: dto.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      passingScore: dto.passingScore || 70,
      status: dto.status || JobStatus.ACTIVE,
    });

    const saved = await job.save();

    await this.recordAudit(admin.sub, 'RESTORE_JOB', 'job', saved._id.toString(), {
      action: 'ADMIN_CREATE_JOB',
      title: dto.title,
    });

    return saved;
  }

  async updateJob(admin: TokenPayload, jobId: string, dto: any) {
    const job = await this.jobModel.findById(jobId);
    if (!job) throw new NotFoundException(`Job #${jobId} not found`);

    const fields = [
      'title',
      'description',
      'requiredSkills',
      'location',
      'salaryRange',
      'deadline',
      'passingScore',
      'status',
      'quizId',
      'courseId',
    ];

    fields.forEach((f) => {
      if (dto[f] !== undefined) {
        (job as any)[f] = dto[f];
      }
    });

    const updated = await job.save();

    await this.recordAudit(admin.sub, 'RESTORE_JOB', 'job', jobId, {
      action: 'ADMIN_UPDATE_JOB',
      updatedFields: Object.keys(dto),
    });

    return updated;
  }

  async deleteJob(admin: TokenPayload, jobId: string) {
    const job = await this.jobModel.findByIdAndDelete(jobId);
    if (!job) throw new NotFoundException(`Job #${jobId} not found`);

    // Clean up attempts
    await this.attemptModel.deleteMany({ jobId });

    await this.recordAudit(admin.sub, 'DELETE_JOB', 'job', jobId, {
      title: job.title,
    });

    return { success: true, message: 'Job circular permanently deleted (RULE-007)' };
  }

  async suspendJob(admin: TokenPayload, jobId: string, reason?: string) {
    const job = await this.jobModel.findByIdAndUpdate(
      jobId,
      { status: JobStatus.SUSPENDED },
      { new: true },
    );
    if (!job) throw new NotFoundException(`Job #${jobId} not found`);
    await this.recordAudit(admin.sub, 'SUSPEND_JOB', 'job', jobId, { reason });
    return job;
  }

  async restoreJob(admin: TokenPayload, jobId: string) {
    const job = await this.jobModel.findByIdAndUpdate(
      jobId,
      { status: JobStatus.ACTIVE },
      { new: true },
    );
    if (!job) throw new NotFoundException(`Job #${jobId} not found`);
    await this.recordAudit(admin.sub, 'RESTORE_JOB', 'job', jobId);
    return job;
  }

  // ==================== QUIZ MANAGEMENT ====================

  async getAllQuizzes() {
    const quizzes = await this.quizModel.find().sort({ createdAt: -1 }).exec();
    return Promise.all(
      quizzes.map(async (q) => {
        const job = await this.jobModel.findById(q.jobId).select('title companyName').exec();
        return {
          _id: q._id,
          jobId: q.jobId,
          jobTitle: job?.title || 'Unknown Job',
          companyName: job?.companyName || 'Unknown Company',
          employerId: q.employerId,
          passingScore: q.passingScore,
          timeLimit: q.timeLimit,
          questionsCount: q.questions?.length || 0,
          createdAt: (q as any).createdAt,
          updatedAt: (q as any).updatedAt,
        };
      }),
    );
  }

  async getQuizById(quizId: string) {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) throw new NotFoundException(`Quiz #${quizId} not found`);
    const job = await this.jobModel.findById(quiz.jobId).select('title companyName').exec();
    return {
      ...quiz.toObject(),
      jobTitle: job?.title,
      companyName: job?.companyName,
    };
  }

  async createQuiz(admin: TokenPayload, dto: any) {
    const job = await this.jobModel.findById(dto.jobId);
    if (!job) throw new NotFoundException(`Job #${dto.jobId} not found`);

    if (dto.questions.length < 10 || dto.questions.length > 20) {
      throw new BadRequestException(
        `RULE-008: Quiz must have between 10 and 20 questions (provided: ${dto.questions.length})`,
      );
    }

    const quiz = new this.quizModel({
      jobId: dto.jobId,
      employerId: job.employerId || admin.sub,
      questions: dto.questions,
      passingScore: dto.passingScore || job.passingScore || 70,
      timeLimit: dto.timeLimit,
    });

    const saved = await quiz.save();
    job.quizId = saved._id.toString();
    await job.save();

    await this.recordAudit(admin.sub, 'OVERRIDE_QUIZ_STATE', 'quiz', saved._id.toString(), {
      action: 'ADMIN_CREATE_QUIZ',
      jobId: dto.jobId,
    });

    return saved;
  }

  async updateQuiz(admin: TokenPayload, quizId: string, dto: any) {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new NotFoundException(`Quiz #${quizId} not found`);

    if (dto.questions) {
      if (dto.questions.length < 10 || dto.questions.length > 20) {
        throw new BadRequestException(
          `RULE-008: Quiz must have between 10 and 20 questions (provided: ${dto.questions.length})`,
        );
      }
      quiz.questions = dto.questions;
    }

    if (dto.passingScore !== undefined) {
      quiz.passingScore = dto.passingScore;
    }
    if (dto.timeLimit !== undefined) {
      quiz.timeLimit = dto.timeLimit;
    }

    const updated = await quiz.save();

    await this.recordAudit(admin.sub, 'OVERRIDE_QUIZ_STATE', 'quiz', quizId, {
      action: 'ADMIN_UPDATE_QUIZ',
      updatedFields: Object.keys(dto),
    });

    return updated;
  }

  async deleteQuiz(admin: TokenPayload, quizId: string) {
    const quiz = await this.quizModel.findByIdAndDelete(quizId);
    if (!quiz) throw new NotFoundException(`Quiz #${quizId} not found`);

    // Detach quiz from Job
    await this.jobModel.updateMany({ quizId }, { $unset: { quizId: 1 } });

    await this.recordAudit(admin.sub, 'DELETE_QUIZ', 'quiz', quizId, {
      jobId: quiz.jobId,
    });

    return { success: true, message: 'Quiz deleted and detached from circular (RULE-007)' };
  }

  // ==================== COURSE MANAGEMENT ====================

  async getAllCourses() {
    const courses = await this.courseModel.find().sort({ createdAt: -1 }).exec();
    return Promise.all(
      courses.map(async (c) => {
        const job = await this.jobModel.findById(c.jobId).select('title companyName').exec();
        return {
          _id: c._id,
          jobId: c.jobId,
          jobTitle: job?.title || 'Unknown Job',
          companyName: job?.companyName || 'Unknown Company',
          employerId: c.employerId,
          title: c.title,
          description: c.description,
          modulesCount: c.modules?.length || 0,
          createdAt: (c as any).createdAt,
          updatedAt: (c as any).updatedAt,
        };
      }),
    );
  }

  async getCourseById(courseId: string) {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) throw new NotFoundException(`Course #${courseId} not found`);
    const job = await this.jobModel.findById(course.jobId).select('title companyName').exec();
    return {
      ...course.toObject(),
      jobTitle: job?.title,
      companyName: job?.companyName,
    };
  }

  async createCourse(admin: TokenPayload, dto: any) {
    const job = await this.jobModel.findById(dto.jobId);
    if (!job) throw new NotFoundException(`Job #${dto.jobId} not found`);

    const course = new this.courseModel({
      jobId: dto.jobId,
      employerId: job.employerId || admin.sub,
      title: dto.title,
      description: dto.description,
      modules: dto.modules || [],
    });

    const saved = await course.save();
    job.courseId = saved._id.toString();
    await job.save();

    await this.recordAudit(admin.sub, 'DELETE_COURSE', 'course', saved._id.toString(), {
      action: 'ADMIN_CREATE_COURSE',
      jobId: dto.jobId,
    });

    return saved;
  }

  async updateCourse(admin: TokenPayload, courseId: string, dto: any) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException(`Course #${courseId} not found`);

    if (dto.title) course.title = dto.title;
    if (dto.description !== undefined) course.description = dto.description;
    if (dto.modules) course.modules = dto.modules;

    const updated = await course.save();

    await this.recordAudit(admin.sub, 'DELETE_COURSE', 'course', courseId, {
      action: 'ADMIN_UPDATE_COURSE',
    });

    return updated;
  }

  async deleteCourse(admin: TokenPayload, courseId: string) {
    const course = await this.courseModel.findByIdAndDelete(courseId);
    if (!course) throw new NotFoundException(`Course #${courseId} not found`);

    // Detach from Job
    await this.jobModel.updateMany({ courseId }, { $unset: { courseId: 1 } });

    await this.recordAudit(admin.sub, 'DELETE_COURSE', 'course', courseId, {
      jobId: course.jobId,
    });

    return { success: true, message: 'Grooming course deleted and detached from circular (RULE-007)' };
  }

  // ==================== QUIZ ATTEMPTS & OVERRIDES ====================

  async getAllQuizAttempts() {
    const attempts = await this.attemptModel.find().sort({ updatedAt: -1 }).limit(100).exec();
    return Promise.all(
      attempts.map(async (att) => {
        const [applicant, job] = await Promise.all([
          this.userModel.findById(att.applicantId).select('fullName email').exec(),
          this.jobModel.findById(att.jobId).select('title companyName').exec(),
        ]);
        return {
          _id: att._id,
          applicantId: att.applicantId,
          applicantName: applicant?.fullName || applicant?.email || 'Unknown',
          jobId: att.jobId,
          jobTitle: job?.title || 'Unknown Job',
          companyName: job?.companyName || 'Unknown Company',
          state: att.state,
          integrityFlags: att.integrityFlags || 0,
          attemptsCount: att.attempts?.length || 0,
          latestScore:
            att.attempts && att.attempts.length > 0
              ? att.attempts[att.attempts.length - 1].score
              : null,
          updatedAt: (att as any).updatedAt || new Date().toISOString(),
        };
      }),
    );
  }

  async overrideQuizState(
    admin: TokenPayload,
    attemptId: string,
    state: QuizAttemptState,
  ) {
    const attempt = await this.attemptModel.findById(attemptId);
    if (!attempt) throw new NotFoundException(`QuizAttempt #${attemptId} not found`);

    const previousAttempts = attempt.attempts ? [...attempt.attempts] : [];
    const isReset = state === QuizAttemptState.NOT_STARTED;

    attempt.state = state;
    if (isReset) {
      attempt.attempts = [];
      delete attempt.startedAt;
      attempt.integrityFlags = 0;
    }

    await attempt.save();

    // RULE-014: Admin override archives previous attempts into AuditLog
    await this.recordAudit(admin.sub, 'OVERRIDE_QUIZ_STATE', 'quiz', attemptId, {
      state,
      previousAttempts: isReset ? previousAttempts : undefined,
      resetAttemptsCount: isReset ? previousAttempts.length : undefined,
    });

    return attempt;
  }

  async deleteQuizAttempt(admin: TokenPayload, attemptId: string) {
    const attempt = await this.attemptModel.findByIdAndDelete(attemptId);
    if (!attempt) throw new NotFoundException(`QuizAttempt #${attemptId} not found`);

    await this.recordAudit(admin.sub, 'OVERRIDE_QUIZ_STATE', 'quiz', attemptId, {
      action: 'DELETE_QUIZ_ATTEMPT',
      applicantId: attempt.applicantId,
      jobId: attempt.jobId,
    });

    return { success: true, message: 'Quiz attempt permanently removed' };
  }

  // ==================== PLATFORM ANALYTICS ====================

  async getPlatformAnalytics() {
    const [
      users,
      jobs,
      quizzes,
      courses,
      attempts,
      reviews,
      progresses,
    ] = await Promise.all([
      this.userModel.find().exec(),
      this.jobModel.find().exec(),
      this.quizModel.find().exec(),
      this.courseModel.find().exec(),
      this.attemptModel.find().exec(),
      this.candidateReviewModel.find().exec(),
      this.progressModel.find().exec(),
    ]);

    // Users breakdown
    const totalUsers = users.length;
    const applicants = users.filter((u) => u.role === Role.APPLICANT);
    const employers = users.filter((u) => u.role === Role.EMPLOYER);
    const admins = users.filter((u) => u.role === Role.ADMIN);
    const activeUsers = users.filter((u) => u.status === UserStatus.ACTIVE).length;
    const suspendedUsers = users.filter((u) => u.status === UserStatus.SUSPENDED).length;

    // Jobs breakdown
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === JobStatus.ACTIVE).length;
    const suspendedJobs = jobs.filter((j) => j.status === JobStatus.SUSPENDED).length;
    const closedJobs = jobs.filter((j) => j.status === JobStatus.CLOSED).length;

    // Assessment & Qualification Funnel
    let totalAttemptsCount = 0;
    let totalScoreSum = 0;
    let passedCount = 0;
    let failedCount = 0;
    let totalIntegrityFlags = 0;

    attempts.forEach((a) => {
      totalIntegrityFlags += a.integrityFlags || 0;
      if (a.state === QuizAttemptState.PASSED || a.state === QuizAttemptState.FINAL_PASSED) {
        passedCount++;
      } else {
        failedCount++;
      }
      (a.attempts || []).forEach((att) => {
        totalAttemptsCount++;
        totalScoreSum += att.score || 0;
      });
    });

    const averageScore = totalAttemptsCount > 0 ? Math.round(totalScoreSum / totalAttemptsCount) : 0;
    const passRate = attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 0;

    // Grooming metrics
    const groomingEnrolled = attempts.filter(
      (a) =>
        a.state === QuizAttemptState.GROOMING_REQUIRED ||
        a.state === QuizAttemptState.GROOMING_COMPLETE ||
        a.state === QuizAttemptState.FINAL_ATTEMPTED ||
        a.state === QuizAttemptState.FINAL_PASSED ||
        a.state === QuizAttemptState.FINAL_FAILED,
    ).length;
    const groomingCompleted = progresses.filter((p) => p.completed).length;

    // Pipeline breakdown
    const pipeline = {
      new: reviews.filter((r) => r.status === ApplicationStatus.NEW).length,
      reviewed: reviews.filter((r) => r.status === ApplicationStatus.REVIEWED).length,
      shortlisted: reviews.filter((r) => r.status === ApplicationStatus.SHORTLISTED).length,
      interview: reviews.filter((r) => r.status === ApplicationStatus.INTERVIEW).length,
      offered: reviews.filter((r) => r.status === ApplicationStatus.OFFERED).length,
      rejected: reviews.filter((r) => r.status === ApplicationStatus.REJECTED).length,
    };

    // Employers Activity
    const employerActivity = employers.map((emp) => {
      const empJobs = jobs.filter((j) => j.employerId.toString() === emp._id.toString());
      const jobIds = empJobs.map((j) => j._id.toString());
      const empAttempts = attempts.filter((a) => jobIds.includes(a.jobId.toString()));
      const certified = empAttempts.filter(
        (a) => a.state === QuizAttemptState.PASSED || a.state === QuizAttemptState.FINAL_PASSED,
      ).length;

      return {
        employerId: emp._id,
        companyName: emp.companyName || emp.fullName || '—',
        email: emp.email,
        status: emp.status,
        jobsCount: empJobs.length,
        applicantsCount: empAttempts.length,
        certifiedCandidates: certified,
      };
    });

    // Top skills requested in active jobs
    const skillCounts: Record<string, number> = {};
    jobs.forEach((j) => {
      (j.requiredSkills || []).forEach((skill) => {
        const s = skill.trim();
        if (s) {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        }
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      kpis: {
        totalUsers,
        totalApplicants: applicants.length,
        totalEmployers: employers.length,
        totalAdmins: admins.length,
        activeUsers,
        suspendedUsers,
        totalJobs,
        activeJobs,
        suspendedJobs,
        closedJobs,
        totalQuizzes: quizzes.length,
        totalCourses: courses.length,
        totalAssessmentsTaken: attempts.length,
        totalAttemptsRecorded: totalAttemptsCount,
        passedCount,
        failedCount,
        passRate,
        averageScore,
        groomingEnrolled,
        groomingCompleted,
        totalIntegrityFlags,
      },
      pipeline,
      topSkills,
      employers: employerActivity,
    };
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(): Promise<AuditLogDocument[]> {
    return this.auditModel.find().sort({ createdAt: -1 }).limit(100).exec();
  }
}
