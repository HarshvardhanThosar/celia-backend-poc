import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ Import ConfigModule
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
