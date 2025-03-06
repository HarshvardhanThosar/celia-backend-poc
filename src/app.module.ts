import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [DatabaseModule, KeycloakModule, CommunityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
