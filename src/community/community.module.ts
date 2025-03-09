import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { TaskModule } from './task/task.module';
import { RetailModule } from './retail/retail.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService],
  imports: [TaskModule, RetailModule, ProfileModule, AuthModule],
})
export class CommunityModule {}
