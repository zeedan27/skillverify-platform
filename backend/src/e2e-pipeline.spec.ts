import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { QuizService } from './modules/quiz/quiz.service';
import { ProgressService } from './modules/progress/progress.service';
import { LeaderboardService } from './modules/leaderboard/leaderboard.service';
import { Quiz } from './modules/quiz/schemas/quiz.schema';
import { QuizAttempt } from './modules/quiz/schemas/quiz-attempt.schema';
import { CourseProgress } from './modules/progress/schemas/progress.schema';
import { Job } from './modules/jobs/schemas/job.schema';
import { User } from './modules/users/schemas/user.schema';
import { Course } from './modules/course/schemas/course.schema';
import { CandidateReview } from './modules/leaderboard/schemas/candidate-review.schema';
import { InterviewSchedule } from './modules/leaderboard/schemas/interview-schedule.schema';
import { OfferLetter } from './modules/leaderboard/schemas/offer-letter.schema';
import { NotificationsService } from './modules/notifications/notifications.service';
import { BadgesService } from './modules/badges/badges.service';
import { JobsService } from './modules/jobs/jobs.service';
import { CourseService } from './modules/course/course.service';
import { Role, QuizAttemptState } from '@skillverify/shared';
import { ForbiddenException } from '@nestjs/common';

describe('SkillVerify End-to-End Verification Pipeline', () => {
  let quizService: QuizService;
  let progressService: ProgressService;
  let leaderboardService: LeaderboardService;

  let quizAttemptsStore: any[] = [];
  let courseProgressStore: any[] = [];

  const mockQuiz = {
    _id: 'quiz-001',
    jobId: 'job-001',
    employerId: 'emp-001',
    passingScore: 70,
    timeLimit: 15,
    questions: Array.from({ length: 10 }).map((_, i) => ({
      _id: `q-${i + 1}`,
      text: `Question ${i + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
    })),
  };

  const mockJob = {
    _id: 'job-001',
    title: 'Senior Frontend Engineer',
    companyName: 'Google LLC',
    employerId: 'emp-001',
    passingScore: 70,
  };

  const mockCourse = {
    _id: 'course-001',
    jobId: 'job-001',
    employerId: 'emp-001',
    title: 'Frontend Grooming Course',
    modules: [
      { _id: 'mod-1', title: 'React Core', type: 'text' },
      { _id: 'mod-2', title: 'State Architecture', type: 'video' },
    ],
  };

  beforeEach(async () => {
    quizAttemptsStore = [];
    courseProgressStore = [];

    const mockQuizModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQuiz),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQuiz),
      }),
    };

    class MockQuizAttemptDoc {
      applicantId: string;
      jobId: string;
      quizId: string;
      state: any;
      attempts: any[] = [];
      _id: string = 'attempt-doc-001';

      constructor(data: any) {
        Object.assign(this, data);
        if (!this.attempts) this.attempts = [];
      }

      async save() {
        const existingIdx = quizAttemptsStore.findIndex(
          (a) => a.applicantId === this.applicantId && a.jobId === this.jobId,
        );
        if (existingIdx >= 0) {
          quizAttemptsStore[existingIdx] = this;
        } else {
          quizAttemptsStore.push(this);
        }
        return this;
      }
    }

    const mockQuizAttemptModel: any = MockQuizAttemptDoc;

    mockQuizAttemptModel.findOne = jest.fn().mockImplementation((query) => {
      const doc =
        quizAttemptsStore.find(
          (a) => a.applicantId === query.applicantId && a.jobId === query.jobId,
        ) || null;
      return {
        then: (resolve: any) => Promise.resolve(resolve(doc)),
        exec: jest.fn().mockResolvedValue(doc),
      };
    });

    mockQuizAttemptModel.find = jest.fn().mockImplementation((query) => {
      const docs = quizAttemptsStore.filter(
        (a) =>
          a.jobId === query.jobId &&
          (!query.state || query.state.$in.includes(a.state)),
      );
      return {
        then: (resolve: any) => Promise.resolve(resolve(docs)),
        exec: jest.fn().mockResolvedValue(docs),
      };
    });

    class MockCourseProgressDoc {
      applicantId: string;
      courseId: string;
      jobId: string;
      completed: boolean = false;
      moduleProgress: any[] = [];
      _id: string = 'progress-doc-001';

      constructor(data: any) {
        Object.assign(this, data);
        if (!this.moduleProgress) this.moduleProgress = [];
      }

      async save() {
        const existingIdx = courseProgressStore.findIndex(
          (p) => p.applicantId === this.applicantId && p.courseId === this.courseId,
        );
        if (existingIdx >= 0) {
          courseProgressStore[existingIdx] = this;
        } else {
          courseProgressStore.push(this);
        }
        return this;
      }
    }

    const mockCourseProgressModel: any = MockCourseProgressDoc;

    mockCourseProgressModel.findOne = jest.fn().mockImplementation((query) => {
      const doc =
        courseProgressStore.find(
          (p) =>
            p.applicantId === query.applicantId &&
            (query.courseId ? p.courseId === query.courseId : true) &&
            (query.jobId ? p.jobId === query.jobId : true) &&
            (query.completed !== undefined ? p.completed === query.completed : true),
        ) || null;
      return {
        then: (resolve: any) => Promise.resolve(resolve(doc)),
        exec: jest.fn().mockResolvedValue(doc),
      };
    });

    const mockJobModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockJob),
      }),
    };

    const mockUserModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          fullName: 'Alex Mercer',
          email: 'applicant@skillverify.com',
        }),
      }),
    };

    const mockJobsService = {
      findById: jest.fn().mockResolvedValue(mockJob),
    };

    const mockCourseService = {
      getCourseById: jest.fn().mockResolvedValue(mockCourse),
      getCourseByJobId: jest.fn().mockResolvedValue(mockCourse),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        ProgressService,
        LeaderboardService,
        { provide: getModelToken(Quiz.name), useValue: mockQuizModel },
        { provide: getModelToken(QuizAttempt.name), useValue: mockQuizAttemptModel },
        { provide: getModelToken(CourseProgress.name), useValue: mockCourseProgressModel },
        { provide: getModelToken(Job.name), useValue: mockJobModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Course.name), useValue: {} },
        { provide: getModelToken(CandidateReview.name), useValue: { findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) } },
        { provide: getModelToken(InterviewSchedule.name), useValue: { findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) } },
        { provide: getModelToken(OfferLetter.name), useValue: { findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) } },
        { provide: JobsService, useValue: mockJobsService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: NotificationsService, useValue: { notify: jest.fn().mockResolvedValue(null) } },
        { provide: BadgesService, useValue: { issueOnPass: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    quizService = module.get<QuizService>(QuizService);
    progressService = module.get<ProgressService>(ProgressService);
    leaderboardService = module.get<LeaderboardService>(LeaderboardService);
  });

  it('Complete Lifecycle: Initial Fail -> Grooming Requirement -> Completion -> Final Pass -> Leaderboard Placement', async () => {
    const applicant = {
      sub: 'applicant-001',
      email: 'applicant@skillverify.com',
      role: Role.APPLICANT,
    };

    // 1. First Attempt: Applicant scores 40% (4 correct out of 10) -> Should Fail
    const failAnswers = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1];
    const attempt1Result = await quizService.submitQuiz(applicant, {
      quizId: 'quiz-001',
      jobId: 'job-001',
      answers: failAnswers,
      submittedAt: '2026-09-01T10:00:00Z',
    });

    expect(attempt1Result.score).toBe(40);
    expect(attempt1Result.passed).toBe(false);
    expect(attempt1Result.nextState).toBe(QuizAttemptState.GROOMING_REQUIRED);

    // 2. Gatekeeping: Attempting Quiz 2 before finishing grooming MUST be blocked (RULE-003)
    await expect(
      quizService.submitQuiz(applicant, {
        quizId: 'quiz-001',
        jobId: 'job-001',
        answers: failAnswers,
        submittedAt: '2026-09-01T10:05:00Z',
      }),
    ).rejects.toThrow(ForbiddenException);

    // 3. Grooming: Applicant completes Module 1
    const p1 = await progressService.markModuleComplete(applicant, {
      courseId: 'course-001',
      moduleId: 'mod-1',
    });
    expect(p1.completed).toBe(false);

    // Still cannot take attempt 2 because course is only 50% complete
    await expect(
      quizService.submitQuiz(applicant, {
        quizId: 'quiz-001',
        jobId: 'job-001',
        answers: failAnswers,
        submittedAt: '2026-09-01T10:10:00Z',
      }),
    ).rejects.toThrow(ForbiddenException);

    // Complete Module 2 -> Course becomes 100% completed
    const p2 = await progressService.markModuleComplete(applicant, {
      courseId: 'course-001',
      moduleId: 'mod-2',
    });
    expect(p2.completed).toBe(true);

    // 4. Second Attempt: Now unlocked! Applicant scores 90% (9 correct out of 10)
    const passAnswers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    const attempt2Result = await quizService.submitQuiz(applicant, {
      quizId: 'quiz-001',
      jobId: 'job-001',
      answers: passAnswers,
      submittedAt: '2026-09-01T11:00:00Z',
    });

    expect(attempt2Result.score).toBe(90);
    expect(attempt2Result.passed).toBe(true);
    expect(attempt2Result.nextState).toBe(QuizAttemptState.FINAL_PASSED);

    // 5. Gatekeeping: Attempting a 3rd time MUST be rejected (RULE-002: max 2 attempts)
    await expect(
      quizService.submitQuiz(applicant, {
        quizId: 'quiz-001',
        jobId: 'job-001',
        answers: passAnswers,
        submittedAt: '2026-09-01T11:05:00Z',
      }),
    ).rejects.toThrow(ForbiddenException);

    // 6. Leaderboard Verification:
    const employerUser = { sub: 'emp-001', email: 'employer@google.com', role: Role.EMPLOYER };
    const leaderboard = await leaderboardService.getLeaderboard('job-001', employerUser);

    expect(leaderboard.totalCandidates).toBe(1);
    expect(leaderboard.entries).toHaveLength(1);
    expect(leaderboard.entries[0].fullName).toBe('Alex Mercer');
    expect(leaderboard.entries[0].score).toBe(90);
    expect(leaderboard.entries[0].attemptNumber).toBe(2);
    expect(leaderboard.entries[0].completedGrooming).toBe(true);
  });
});
