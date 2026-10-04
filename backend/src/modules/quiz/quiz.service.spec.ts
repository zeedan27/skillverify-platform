import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { getModelToken } from '@nestjs/mongoose';
import { Quiz } from './schemas/quiz.schema';
import { QuizAttempt } from './schemas/quiz-attempt.schema';
import { JobsService } from '../jobs/jobs.service';
import { ProgressService } from '../progress/progress.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role, QuizAttemptState } from '@skillverify/shared';

import { NotificationsService } from '../notifications/notifications.service';
import { BadgesService } from '../badges/badges.service';

describe('QuizService Business Rules', () => {
  let service: QuizService;
  let mockQuizModel: any;
  let mockAttemptModel: any;
  let mockJobsService: any;
  let mockProgressService: any;
  let mockNotificationsService: any;
  let mockBadgesService: any;

  beforeEach(async () => {
    mockQuizModel = jest.fn();
    mockAttemptModel = jest.fn();
    mockJobsService = {
      findById: jest.fn(),
      attachQuiz: jest.fn(),
    };
    mockProgressService = {
      isGroomingCompleted: jest.fn(),
    };
    mockNotificationsService = {
      notify: jest.fn().mockResolvedValue(null),
    };
    mockBadgesService = {
      issueOnPass: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: getModelToken(Quiz.name), useValue: mockQuizModel },
        { provide: getModelToken(QuizAttempt.name), useValue: mockAttemptModel },
        { provide: JobsService, useValue: mockJobsService },
        { provide: ProgressService, useValue: mockProgressService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: BadgesService, useValue: mockBadgesService },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  describe('RULE-008: Question Count Enforcement', () => {
    it('should throw BadRequestException if quiz has fewer than 10 questions', async () => {
      mockJobsService.findById.mockResolvedValue({
        employerId: 'emp123',
        passingScore: 70,
      });

      const user = { sub: 'emp123', email: 'emp@test.com', role: Role.EMPLOYER };
      const dto = {
        jobId: 'job123',
        questions: Array.from({ length: 9 }).map((_, i) => ({
          text: `Q${i}`,
          options: ['A', 'B', 'C', 'D'],
          correctIndex: 0,
        })),
      };

      await expect(service.createQuiz(user, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if quiz has more than 20 questions', async () => {
      mockJobsService.findById.mockResolvedValue({
        employerId: 'emp123',
        passingScore: 70,
      });

      const user = { sub: 'emp123', email: 'emp@test.com', role: Role.EMPLOYER };
      const dto = {
        jobId: 'job123',
        questions: Array.from({ length: 21 }).map((_, i) => ({
          text: `Q${i}`,
          options: ['A', 'B', 'C', 'D'],
          correctIndex: 0,
        })),
      };

      await expect(service.createQuiz(user, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('RULE-002 & RULE-003: Attempt Gatekeeping', () => {
    it('should throw ForbiddenException if user has already used 2 attempts (RULE-002)', async () => {
      const mockQuiz = {
        _id: 'quiz123',
        passingScore: 70,
        questions: Array.from({ length: 10 }).map((_, i) => ({
          _id: `q${i}`,
          correctIndex: 0,
        })),
      };

      mockQuizModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQuiz),
      });

      mockAttemptModel.findOne = jest.fn().mockResolvedValue({
        applicantId: 'app123',
        jobId: 'job123',
        attempts: [
          { attemptNumber: 1, score: 50, submittedAt: '', answers: [] },
          { attemptNumber: 2, score: 60, submittedAt: '', answers: [] },
        ],
        state: QuizAttemptState.FINAL_FAILED,
      });

      const user = { sub: 'app123', email: 'app@test.com', role: Role.APPLICANT };
      const submission = {
        quizId: 'quiz123',
        jobId: 'job123',
        answers: new Array(10).fill(0),
        submittedAt: new Date().toISOString(),
      };

      await expect(service.submitQuiz(user, submission)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for attempt 2 if grooming course is incomplete (RULE-003)', async () => {
      const mockQuiz = {
        _id: 'quiz123',
        passingScore: 70,
        questions: Array.from({ length: 10 }).map((_, i) => ({
          _id: `q${i}`,
          correctIndex: 0,
        })),
      };

      mockQuizModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQuiz),
      });

      mockAttemptModel.findOne = jest.fn().mockResolvedValue({
        applicantId: 'app123',
        jobId: 'job123',
        attempts: [{ attemptNumber: 1, score: 40, submittedAt: '', answers: [] }],
        state: QuizAttemptState.GROOMING_REQUIRED,
      });

      mockProgressService.isGroomingCompleted.mockResolvedValue(false);

      const user = { sub: 'app123', email: 'app@test.com', role: Role.APPLICANT };
      const submission = {
        quizId: 'quiz123',
        jobId: 'job123',
        answers: new Array(10).fill(0),
        submittedAt: new Date().toISOString(),
      };

      await expect(service.submitQuiz(user, submission)).rejects.toThrow(ForbiddenException);
    });
  });
});
