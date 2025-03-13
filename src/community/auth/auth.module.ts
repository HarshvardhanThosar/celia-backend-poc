import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeycloakModule } from 'src/keycloak/keycloak.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [KeycloakModule, ProfileModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
