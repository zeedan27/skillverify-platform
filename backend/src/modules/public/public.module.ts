import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { QuizAttempt, QuizAttemptSchema } from '../quiz/schemas/quiz-attempt.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    BadgesModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
