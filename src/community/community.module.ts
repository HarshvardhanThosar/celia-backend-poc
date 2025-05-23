import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { RetailModule } from './retail/retail.module';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService],
  imports: [ProfileModule, AuthModule, TasksModule, RetailModule],
  exports: [CommunityService],
})
export class CommunityModule {}
