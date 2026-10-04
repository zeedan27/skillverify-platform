import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseProgress, CourseProgressSchema } from './schemas/progress.schema';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CourseProgress.name, schema: CourseProgressSchema }]),
    forwardRef(() => CourseModule),
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService, MongooseModule],
})
export class ProgressModule {}
