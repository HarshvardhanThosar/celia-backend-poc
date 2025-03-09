import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { KeycloakModule } from 'src/keycloak/keycloak.module';

@Module({
  imports: [ConfigModule.forRoot(), KeycloakModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
