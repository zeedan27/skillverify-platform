import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardService } from './leaderboard.service';
import { getModelToken } from '@nestjs/mongoose';
import { QuizAttempt } from '../quiz/schemas/quiz-attempt.schema';
import { Job } from '../jobs/schemas/job.schema';
import { User } from '../users/schemas/user.schema';
import { CourseProgress } from '../progress/schemas/progress.schema';
import { CandidateReview } from './schemas/candidate-review.schema';
import { InterviewSchedule } from './schemas/interview-schedule.schema';
import { OfferLetter } from './schemas/offer-letter.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { Role, QuizAttemptState } from '@skillverify/shared';

describe('LeaderboardService Scoping (RULE-005 & RULE-006)', () => {
  let service: LeaderboardService;
  let mockAttemptModel: any;
  let mockJobModel: any;
  let mockUserModel: any;
  let mockProgressModel: any;
  let mockCandidateReviewModel: any;
  let mockInterviewModel: any;
  let mockOfferModel: any;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockAttemptModel = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    mockJobModel = {
      findById: jest.fn(),
    };
    mockUserModel = {
      findById: jest.fn(),
    };
    mockProgressModel = {
      findOne: jest.fn(),
    };
    mockCandidateReviewModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    mockInterviewModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    mockOfferModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    mockNotificationsService = {
      notify: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        { provide: getModelToken(QuizAttempt.name), useValue: mockAttemptModel },
        { provide: getModelToken(Job.name), useValue: mockJobModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(CourseProgress.name), useValue: mockProgressModel },
        { provide: getModelToken(CandidateReview.name), useValue: mockCandidateReviewModel },
        { provide: getModelToken(InterviewSchedule.name), useValue: mockInterviewModel },
        { provide: getModelToken(OfferLetter.name), useValue: mockOfferModel },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  it('RULE-006: should return ONLY selfEntry and an empty entries array when requested by an APPLICANT', async () => {
    const jobId = 'job123';
    mockJobModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: jobId,
        title: 'Software Engineer',
        companyName: 'Acme Corp',
      }),
    });

    const attempts = [
      {
        applicantId: 'app1',
        jobId,
        state: QuizAttemptState.PASSED,
        attempts: [{ attemptNumber: 1, score: 95, submittedAt: '2026-09-01T10:00:00Z' }],
      },
      {
        applicantId: 'app2',
        jobId,
        state: QuizAttemptState.PASSED,
        attempts: [{ attemptNumber: 1, score: 85, submittedAt: '2026-09-01T11:00:00Z' }],
      },
    ];

    mockAttemptModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(attempts),
    });

    mockUserModel.findById.mockImplementation((id: string) => ({
      exec: jest.fn().mockResolvedValue({ fullName: id === 'app1' ? 'Alice' : 'Bob' }),
    }));

    mockProgressModel.findOne.mockResolvedValue({ completed: false });

    const applicantUser = { sub: 'app2', email: 'bob@test.com', role: Role.APPLICANT };

    const result = await service.getLeaderboard(jobId, applicantUser);

    expect(result.jobId).toBe(jobId);
    expect(result.totalCandidates).toBe(2);
    // Crucial: entries array MUST be stripped/empty for applicant
    expect(result.entries).toHaveLength(0);
    // Self entry MUST be populated with rank 2 and score 85
    expect(result.selfEntry).toBeDefined();
    expect(result.selfEntry?.rank).toBe(2);
    expect(result.selfEntry?.score).toBe(85);
    expect(result.selfEntry?.applicantId).toBe('app2');
  });

  it('should return full candidate list with CV URLs when requested by an EMPLOYER', async () => {
    const jobId = 'job123';
    mockJobModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: jobId,
        title: 'Software Engineer',
        companyName: 'Acme Corp',
      }),
    });

    const attempts = [
      {
        applicantId: 'app1',
        jobId,
        state: QuizAttemptState.PASSED,
        attempts: [{ attemptNumber: 1, score: 95, submittedAt: '2026-09-01T10:00:00Z' }],
      },
    ];

    mockAttemptModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(attempts),
    });

    mockUserModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ fullName: 'Alice' }),
    });

    mockProgressModel.findOne.mockResolvedValue({ completed: false });

    const employerUser = { sub: 'emp1', email: 'emp@acme.com', role: Role.EMPLOYER };

    const result = await service.getLeaderboard(jobId, employerUser);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].fullName).toBe('Alice');
    expect(result.entries[0].cvUrl).toBe('/api/cv/candidate/app1');
    expect(result.selfEntry).toBeUndefined();
  });
});
