import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { QuizAttempt, QuizAttemptDocument } from './schemas/quiz-attempt.schema';
import { JobsService } from '../jobs/jobs.service';
import { ProgressService } from '../progress/progress.service';
import { BadgesService } from '../badges/badges.service';
import {
  CreateQuizDto,
  QuizSubmission,
  QuizResult,
  QuizAttemptState,
  TokenPayload,
  Role,
  NotificationType,
  RecordIntegrityEventDto,
  IntegrityEventType,
} from '@skillverify/shared';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name) private attemptModel: Model<QuizAttemptDocument>,
    private jobsService: JobsService,
    private progressService: ProgressService,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => BadgesService)) private badgesService: BadgesService,
  ) {}

  async createQuiz(user: TokenPayload, dto: CreateQuizDto): Promise<QuizDocument> {
    const job = await this.jobsService.findById(dto.jobId);
    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only the job poster can attach a quiz');
    }

    const poolSize = dto.questions.length;
    const deliverCount = dto.deliverCount || poolSize;

    // RULE-008 & RULE-017: If deliverCount is set, deliverCount must be between 10 and 20; pool size must not exceed 40
    if (poolSize < 10 || poolSize > 40) {
      throw new BadRequestException(
        `RULE-008 & RULE-017: Question pool size must be between 10 and 40 questions (provided: ${poolSize})`,
      );
    }

    if (deliverCount < 10 || deliverCount > 20) {
      throw new BadRequestException(
        `RULE-017: Questions delivered to applicant must be between 10 and 20 (provided: ${deliverCount})`,
      );
    }

    if (poolSize < deliverCount) {
      throw new BadRequestException(
        `RULE-017: Pool size (${poolSize}) cannot be smaller than deliver count (${deliverCount})`,
      );
    }

    // Validate options and correct answer configuration (supports multi-answer RULE-015)
    for (let i = 0; i < dto.questions.length; i++) {
      const q = dto.questions[i];
      if (!q.options || q.options.length !== 4) {
        throw new BadRequestException(`Question #${i + 1} must have exactly 4 options.`);
      }
      if (q.isMultiple) {
        if (!Array.isArray(q.correctIndices) || q.correctIndices.length === 0) {
          throw new BadRequestException(
            `Question #${i + 1} is marked as multi-answer and must have at least one correct option selected.`,
          );
        }
        if (q.correctIndex === undefined) {
          q.correctIndex = q.correctIndices[0];
        }
      } else {
        if (q.correctIndex === undefined || q.correctIndex < 0 || q.correctIndex > 3) {
          throw new BadRequestException(
            `Question #${i + 1} must have a valid correctIndex (0-3).`,
          );
        }
        q.correctIndices = [q.correctIndex];
      }
    }

    let quiz = await this.quizModel.findOne({ jobId: dto.jobId }).exec();

    if (!quiz) {
      quiz = new this.quizModel({
        jobId: dto.jobId,
        employerId: user.sub,
        questions: dto.questions,
        passingScore: job.passingScore || 70,
        timeLimit: dto.timeLimit,
        poolSize,
        deliverCount,
        shuffleOptions: Boolean(dto.shuffleOptions),
      });
    } else {
      quiz.questions = dto.questions as any;
      quiz.passingScore = job.passingScore || 70;
      quiz.timeLimit = dto.timeLimit;
      quiz.poolSize = poolSize;
      quiz.deliverCount = deliverCount;
      quiz.shuffleOptions = Boolean(dto.shuffleOptions);
    }

    const saved = await quiz.save();
    await this.jobsService.attachQuiz(dto.jobId, saved._id.toString());
    return saved;
  }

  async getQuizByJobId(jobId: string, user?: TokenPayload): Promise<any> {
    const quiz = await this.quizModel.findOne({ jobId }).exec();
    if (!quiz) {
      throw new NotFoundException(`No quiz found for job #${jobId}`);
    }

    // If applicant is taking quiz, prepare or retrieve their served subset and option shuffling
    if (user && user.role === Role.APPLICANT) {
      let attemptDoc = await this.attemptModel.findOne({ applicantId: user.sub, jobId }).exec();

      if (!attemptDoc) {
        attemptDoc = new this.attemptModel({
          applicantId: user.sub,
          jobId,
          quizId: quiz._id.toString(),
          state: QuizAttemptState.NOT_STARTED,
          attempts: [],
          integrityFlags: 0,
          integrityEvents: [],
        });
      }

      // RULE-017: If deliverCount is set, served questions must be a random subset of the question pool
      const pool = quiz.questions;
      const deliverTarget =
        quiz.deliverCount && quiz.deliverCount >= 10 && quiz.deliverCount <= 20
          ? quiz.deliverCount
          : pool.length;

      let servedQuestionIds = attemptDoc.servedQuestionIds || [];
      let optionOrders = attemptDoc.optionOrders || [];

      // Generate served subset and option orders if not yet locked for the current attempt cycle
      const isNewCycle =
        servedQuestionIds.length === 0 ||
        (attemptDoc.attempts.length === 1 && attemptDoc.state === QuizAttemptState.GROOMING_COMPLETE);

      if (isNewCycle || servedQuestionIds.length !== deliverTarget) {
        // Sample questions from pool randomly
        const indices = pool.map((_, idx) => idx);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const chosenIndices = indices.slice(0, deliverTarget);

        servedQuestionIds = chosenIndices.map(
          (idx) => pool[idx]._id?.toString() || idx.toString(),
        );

        // Generate option shuffle orders if shuffleOptions is active
        optionOrders = chosenIndices.map(() => {
          if (quiz.shuffleOptions) {
            const perm = [0, 1, 2, 3];
            for (let i = perm.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [perm[i], perm[j]] = [perm[j], perm[i]];
            }
            return perm;
          }
          return [0, 1, 2, 3];
        });

        attemptDoc.servedQuestionIds = servedQuestionIds;
        attemptDoc.optionOrders = optionOrders;
        await attemptDoc.save();
      }

      // Reconstruct delivered questions array according to servedQuestionIds and optionOrders
      const servedQuestions = servedQuestionIds.map((qId, qIdx) => {
        const found =
          pool.find((q) => (q._id ? q._id.toString() : '') === qId) ||
          pool[parseInt(qId, 10)] ||
          pool[0];

        const perm = optionOrders[qIdx] || [0, 1, 2, 3];
        const shuffledOptions = perm.map((origIdx) => found.options[origIdx]);

        return {
          _id: found._id,
          text: found.text,
          options: shuffledOptions,
          isMultiple: Boolean(
            found.isMultiple || (Array.isArray(found.correctIndices) && found.correctIndices.length > 1),
          ),
          difficulty: found.difficulty || 'medium',
        };
      });

      return {
        _id: quiz._id,
        jobId: quiz.jobId,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        poolSize: quiz.poolSize || quiz.questions.length,
        deliverCount: deliverTarget,
        shuffleOptions: quiz.shuffleOptions,
        questions: servedQuestions,
      };
    }

    return quiz;
  }

  async startQuizAttempt(user: TokenPayload, jobId: string): Promise<QuizAttemptDocument> {
    let attemptDoc = await this.attemptModel.findOne({ applicantId: user.sub, jobId });
    const quiz = await this.quizModel.findOne({ jobId }).exec();

    if (!attemptDoc) {
      attemptDoc = new this.attemptModel({
        applicantId: user.sub,
        jobId,
        quizId: quiz ? quiz._id.toString() : '',
        state: QuizAttemptState.NOT_STARTED,
        attempts: [],
        startedAt: new Date().toISOString(),
        integrityFlags: 0,
        integrityEvents: [],
      });
    } else {
      attemptDoc.startedAt = new Date().toISOString();
      if (quiz && !attemptDoc.quizId) {
        attemptDoc.quizId = quiz._id.toString();
      }
    }

    return attemptDoc.save();
  }

  async recordIntegrityFlag(user: TokenPayload, jobId: string): Promise<{ integrityFlags: number }> {
    return this.recordIntegrityEvent(user, jobId, { type: IntegrityEventType.WINDOW_BLUR });
  }

  async recordIntegrityEvent(
    user: TokenPayload,
    jobId: string,
    dto: RecordIntegrityEventDto,
  ): Promise<{ integrityFlags: number; integrityEvents: any[] }> {
    let attemptDoc = await this.attemptModel.findOne({ applicantId: user.sub, jobId });
    if (!attemptDoc) {
      attemptDoc = new this.attemptModel({
        applicantId: user.sub,
        jobId,
        quizId: '',
        state: QuizAttemptState.NOT_STARTED,
        attempts: [],
        integrityFlags: 0,
        integrityEvents: [],
      });
    }

    if (!attemptDoc.integrityEvents) {
      attemptDoc.integrityEvents = [];
    }

    // RULE-018: Exam integrity events never automatically fail an attempt; recorded as advisory audit events
    const event = {
      type: dto.type,
      at: new Date().toISOString(),
    };

    attemptDoc.integrityEvents.push(event);
    attemptDoc.integrityFlags = (attemptDoc.integrityFlags || 0) + 1;
    await attemptDoc.save();

    return {
      integrityFlags: attemptDoc.integrityFlags,
      integrityEvents: attemptDoc.integrityEvents,
    };
  }

  async getAttemptStatus(applicantId: string, jobId: string): Promise<QuizAttemptDocument | null> {
    return this.attemptModel.findOne({ applicantId, jobId }).exec();
  }

  async getMyApplications(applicantId: string): Promise<any[]> {
    const attempts = await this.attemptModel.find({ applicantId }).sort({ updatedAt: -1 }).exec();
    const results = [];

    for (const attempt of attempts) {
      try {
        const job = await this.jobsService.findById(attempt.jobId);
        let courseProgressInfo: any = null;
        if (job.courseId) {
          try {
            const progress = await this.progressService.getProgress(applicantId, job.courseId);
            if (progress && progress.moduleProgress) {
              const completedCount = progress.moduleProgress.filter((m) => m.completed).length;
              const totalCount = progress.moduleProgress.length;
              const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              courseProgressInfo = {
                completed: progress.completed,
                completedCount,
                totalCount,
                percent,
              };
            }
          } catch (e) {
            // Grooming course progress might not be initiated yet
          }
        }

        results.push({
          attemptId: attempt._id,
          jobId: job._id,
          employerId: job.employerId ? job.employerId.toString() : '',
          jobTitle: job.title,
          companyName: job.companyName,
          location: job.location,
          deadline: job.deadline,
          passingScore: job.passingScore,
          state: attempt.state,
          attempts: attempt.attempts,
          latestScore: attempt.attempts.length > 0 ? attempt.attempts[attempt.attempts.length - 1].score : null,
          courseProgress: courseProgressInfo,
          updatedAt: (attempt as any).updatedAt || new Date().toISOString(),
        });
      } catch (err) {
        // Job not found or deleted, skip
        continue;
      }
    }

    return results;
  }

  async submitQuiz(user: TokenPayload, submission: QuizSubmission): Promise<QuizResult> {
    const quiz = await this.quizModel.findById(submission.quizId).exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz #${submission.quizId} not found`);
    }

    let attemptDoc = await this.attemptModel.findOne({
      applicantId: user.sub,
      jobId: submission.jobId,
    });

    if (!attemptDoc) {
      attemptDoc = new this.attemptModel({
        applicantId: user.sub,
        jobId: submission.jobId,
        quizId: submission.quizId,
        state: QuizAttemptState.NOT_STARTED,
        attempts: [],
        integrityFlags: 0,
        integrityEvents: [],
      });
    }

    if (!attemptDoc.attempts) {
      attemptDoc.attempts = [];
    }

    const currentAttemptCount = attemptDoc.attempts.length;

    // RULE-002: Max 2 attempts
    if (currentAttemptCount >= 2 || attemptDoc.state === QuizAttemptState.LOCKED) {
      throw new ForbiddenException('RULE-002: Maximum quiz attempts (2) reached for this job');
    }

    // RULE-003: Final attempt requires grooming completed
    if (currentAttemptCount === 1) {
      const isGroomingComplete = await this.progressService.isGroomingCompleted(
        user.sub,
        submission.jobId,
      );
      if (!isGroomingComplete) {
        throw new ForbiddenException(
          'RULE-003: Final attempt locked until grooming course is 100% completed',
        );
      }
    }

    // RULE-011: Enforce server timer with 15-second network grace window
    if (quiz.timeLimit && attemptDoc.startedAt) {
      const elapsedSeconds = (Date.now() - new Date(attemptDoc.startedAt).getTime()) / 1000;
      const allowedSeconds = quiz.timeLimit * 60 + 15;
      if (elapsedSeconds > allowedSeconds) {
        throw new BadRequestException('RULE-011: Time limit exceeded. Assessment window closed.');
      }
    }

    // Identify served questions and option orders
    const servedIds =
      attemptDoc.servedQuestionIds && attemptDoc.servedQuestionIds.length > 0
        ? attemptDoc.servedQuestionIds
        : quiz.questions.map((q) => q._id?.toString());

    const servedQuestions = servedIds.map((qId) => {
      return (
        quiz.questions.find((q) => (q._id ? q._id.toString() : '') === qId) ||
        quiz.questions[parseInt(qId, 10)] ||
        quiz.questions[0]
      );
    });

    const optionOrders = attemptDoc.optionOrders || [];

    // Grade submission (RULE-015 + RULE-017)
    let correctCount = 0;
    const breakdown = servedQuestions.map((question, index) => {
      const ans = submission.answers[index];
      const perm = optionOrders[index] || [0, 1, 2, 3];
      const isMulti = question.isMultiple || Array.isArray(question.correctIndices);

      // Map user selected indices back to original option indices using perm
      let origSelectedIndices: number[] = [];
      let origSelectedIndex: number = -1;

      if (isMulti) {
        const rawIndices = Array.isArray(ans) ? [...ans].map(Number) : typeof ans === 'number' ? [ans] : [];
        origSelectedIndices = rawIndices
          .map((userChoice) => perm[userChoice])
          .filter((v) => v !== undefined)
          .sort();
      } else {
        const rawIdx = typeof ans === 'number' ? ans : Array.isArray(ans) && ans.length > 0 ? ans[0] : -1;
        origSelectedIndex = rawIdx >= 0 && rawIdx < perm.length ? perm[rawIdx] : -1;
      }

      let isCorrect = false;
      const correctIndex: number | undefined = question.correctIndex;
      const correctIndices: number[] | undefined = question.correctIndices;

      if (isMulti) {
        const expected = (
          question.correctIndices || (question.correctIndex !== undefined ? [question.correctIndex] : [])
        ).slice().sort();

        isCorrect =
          origSelectedIndices.length === expected.length &&
          origSelectedIndices.every((val, i) => val === expected[i]);
      } else {
        isCorrect = origSelectedIndex !== -1 && origSelectedIndex === question.correctIndex;
      }

      if (isCorrect) correctCount++;

      return {
        questionId: question._id ? question._id.toString() : index.toString(),
        selectedIndex: origSelectedIndex !== -1 ? origSelectedIndex : undefined,
        selectedIndices: isMulti ? origSelectedIndices : undefined,
        correctIndex,
        correctIndices,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctCount / servedQuestions.length) * 100);
    const passed = score >= quiz.passingScore;
    const attemptNumber = (currentAttemptCount + 1) as 1 | 2;

    let nextState: QuizAttemptState;
    if (attemptNumber === 1) {
      nextState = passed ? QuizAttemptState.PASSED : QuizAttemptState.GROOMING_REQUIRED;
    } else {
      nextState = passed ? QuizAttemptState.FINAL_PASSED : QuizAttemptState.FINAL_FAILED;
    }

    // RULE-012: Applicant may only view correct answers and explanations after passing or after final attempt
    const hideAnswers = !passed && attemptNumber === 1 && user.role === Role.APPLICANT;
    const sanitizedBreakdown = breakdown.map((item) => {
      if (hideAnswers) {
        const { correctIndex, correctIndices, explanation, ...rest } = item;
        return rest;
      }
      return item;
    });

    attemptDoc.attempts.push({
      attemptNumber,
      score,
      submittedAt: new Date().toISOString(),
      answers: submission.answers,
    });
    attemptDoc.state = nextState;

    await attemptDoc.save();

    // Async notification dispatches
    (async () => {
      try {
        const job = await this.jobsService.findById(submission.jobId).catch(() => null);
        const jobTitle = job?.title || 'Job Circular';

        // 1. Notify Applicant of their quiz result
        await this.notificationsService.notify(
          user.sub,
          NotificationType.QUIZ_RESULT,
          `Quiz Result: ${passed ? 'Passed' : 'Failed'} (${score}%)`,
          `You scored ${score}% on "${jobTitle}". ${
            passed
              ? 'Congratulations! You have qualified for this position.'
              : attemptNumber === 1
              ? 'Grooming course is now unlocked to prepare for your final attempt.'
              : 'You have exhausted your attempts for this job.'
          }`,
          `/job/${submission.jobId}/quiz`,
        );

        // 2. Notify Employer if top performer (score >= 90)
        if (passed && score >= 90 && job?.employerId) {
          await this.notificationsService.notify(
            job.employerId.toString(),
            NotificationType.NEW_TOP_PERFORMER,
            `Top Performer Alert (${score}%)`,
            `A candidate achieved a top score of ${score}% on "${jobTitle}". Check the leaderboard to review their profile.`,
            `/employer/jobs/${submission.jobId}/leaderboard`,
          );
        }

        // 3. Notify Employer if integrity flags >= 3
        if ((attemptDoc.integrityFlags || 0) >= 3 && job?.employerId) {
          await this.notificationsService.notify(
            job.employerId.toString(),
            NotificationType.INTEGRITY_ALERT,
            `Exam Integrity Alert`,
            `A candidate recorded ${attemptDoc.integrityFlags} integrity flag(s) during the assessment for "${jobTitle}".`,
            `/employer/jobs/${submission.jobId}/leaderboard`,
          );
        }

        // 4. Issue Skill Badge on pass (RULE-020)
        if (passed) {
          await this.badgesService.issueOnPass(user.sub, submission.jobId, score).catch(() => {});
        }
      } catch (e) {
        // Log silently
      }
    })();

    return {
      quizAttemptId: attemptDoc._id.toString(),
      score,
      passed,
      correctCount,
      totalQuestions: servedQuestions.length,
      nextState,
      breakdown: sanitizedBreakdown,
    };
  }
}
