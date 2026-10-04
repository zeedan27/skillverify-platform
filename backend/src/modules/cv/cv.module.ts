import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CVService } from './cv.service';
import { CVController } from './cv.controller';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module';
import { BadgesModule } from '../badges/badges.module';
import { QuizAttempt, QuizAttemptSchema } from '../quiz/schemas/quiz-attempt.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';

@Module({
  imports: [
    UsersModule,
    StorageModule,
    BadgesModule,
    MongooseModule.forFeature([
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  providers: [CVService],
  controllers: [CVController],
  exports: [CVService],
})
export class CVModule {}
