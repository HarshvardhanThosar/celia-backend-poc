import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthGuard,
  KeycloakConnectModule,
  PolicyEnforcementMode,
  ResourceGuard,
  RoleGuard,
  TokenValidation,
} from 'nest-keycloak-connect';
import { KeycloakAdminService } from './admin/keycloak-admin.service';

@Module({
  imports: [
    ConfigModule,
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        authServerUrl: configService.get<string>(
          'KEYCLOAK_URL',
          'http://keycloak-server:8080',
        ),
        realm: configService.get<string>('KEYCLOAK_REALM', 'celia-auth-realm'),
        clientId: configService.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'celia-auth-client',
        ),
        secret: configService.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
          'LjJH6RcoZ7q1dN4z1eg2BtFthFVo7yRG',
        ),
        // policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
        // tokenValidation: TokenValidation.OFFLINE,
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    KeycloakAdminService,
  ],
  exports: [KeycloakConnectModule, KeycloakAdminService],
})
export class KeycloakModule {}
