import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { QuizAttempt, QuizAttemptSchema } from '../quiz/schemas/quiz-attempt.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CourseProgress, CourseProgressSchema } from '../progress/schemas/progress.schema';
import { CandidateReview, CandidateReviewSchema } from './schemas/candidate-review.schema';
import { InterviewSchedule, InterviewScheduleSchema } from './schemas/interview-schedule.schema';
import { OfferLetter, OfferLetterSchema } from './schemas/offer-letter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: CandidateReview.name, schema: CandidateReviewSchema },
      { name: InterviewSchedule.name, schema: InterviewScheduleSchema },
      { name: OfferLetter.name, schema: OfferLetterSchema },
    ]),
  ],
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
