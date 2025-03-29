import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { CommunityModule } from './community/community.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './community/auth/auth.module';
import { ProfileModule } from './community/profile/profile.module';
import { SkillsModule } from './skills/skills.module';
import { TaskTypesModule } from './task_types/task_types.module';
import { MasterModule } from './master/master.module';
import { TasksModule } from './community/tasks/tasks.module';
import { RetailModule } from './community/retail/retail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceCronModule } from './cron/attendance-cron/attendance-cron.module';
import { RetailItemsCronModule } from './cron/retail-items-cron/retail-items-cron.module';

/**
 * TODO:
 * 1. Fix the currency to points ratio in retail items' get requests
 * 2. Update the task types and skill to suit an academic setting
 * 2. Fix the dynamic pricing
 * 3. Validate the flow again
 */

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RouterModule.register([
      {
        path: 'community',
        module: CommunityModule,
        children: [
          {
            path: '/',
            module: AuthModule,
          },
          {
            path: '/',
            module: ProfileModule,
          },
          {
            path: '/',
            module: TasksModule,
          },
          {
            path: '/',
            module: RetailModule,
          },
        ],
      },
    ]),
    DatabaseModule,
    KeycloakModule,
    CommunityModule,
    NotificationsModule,
    SkillsModule,
    TaskTypesModule,
    MasterModule,
    AttendanceCronModule,
    RetailItemsCronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
