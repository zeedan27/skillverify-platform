import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { JobsModule } from '../jobs/jobs.module';
import { ProgressModule } from '../progress/progress.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
    ]),
    forwardRef(() => JobsModule),
    forwardRef(() => ProgressModule),
    forwardRef(() => BadgesModule),
  ],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [QuizService, MongooseModule],
})
export class QuizModule {}
