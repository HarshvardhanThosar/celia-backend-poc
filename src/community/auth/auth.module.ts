import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeycloakModule } from 'src/keycloak/keycloak.module';

@Module({
  imports: [KeycloakModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
