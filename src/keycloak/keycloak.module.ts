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
      useFactory: (config_service: ConfigService) => ({
        authServerUrl: config_service.get<string>(
          'KEYCLOAK_URL',
          'http://keycloak:8080',
        ),
        realm: config_service.get<string>('KEYCLOAK_REALM', 'celia-auth-realm'),
        clientId: config_service.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'celia-auth-client',
        ),
        secret: config_service.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
          'fq3Fvcan8eWHZqZqSbLsVoj0YrdtW6CU',
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
