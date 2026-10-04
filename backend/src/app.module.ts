import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getDatabaseUri } from './database.helper';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { CourseModule } from './modules/course/course.module';
import { ProgressModule } from './modules/progress/progress.module';
import { CVModule } from './modules/cv/cv.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { StorageModule } from './modules/storage/storage.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BadgesModule } from './modules/badges/badges.module';
import { PublicModule } from './modules/public/public.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = await getDatabaseUri();
        return { uri };
      },
    }),
    StorageModule,
    NotificationsModule,
    BadgesModule,
    PublicModule,
    MessagesModule,
    AiModule,
    AuthModule,
    UsersModule,
    JobsModule,
    QuizModule,
    CourseModule,
    ProgressModule,
    CVModule,
    LeaderboardModule,
    AdminModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
