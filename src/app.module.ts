import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { CommunityModule } from './community/community.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './community/auth/auth.module';
import { ProfileModule } from './community/profile/profile.module';

@Module({
  imports: [
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
        ],
      },
    ]),
    DatabaseModule,
    KeycloakModule,
    CommunityModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
