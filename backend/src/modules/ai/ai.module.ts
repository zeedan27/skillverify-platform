import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { QuizGeneratorService } from './quiz-generator.service';
import { Job, JobSchema } from '../jobs/schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  controllers: [AiController],
  providers: [QuizGeneratorService],
  exports: [QuizGeneratorService],
})
export class AiModule {}
