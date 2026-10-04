import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { SkillBadge, SkillBadgeSchema } from './schemas/badge.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SkillBadge.name, schema: SkillBadgeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => JobsModule),
  ],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
