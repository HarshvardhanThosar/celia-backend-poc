import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { TaskModule } from './task/task.module';
import { RetailModule } from './retail/retail.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService],
  imports: [TaskModule, RetailModule, ProfileModule],
})
export class CommunityModule {}
