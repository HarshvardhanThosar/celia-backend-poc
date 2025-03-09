// src/keycloak/keycloak.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
    }), // Loads .env file automatically
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      // policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      // tokenValidation: TokenValidation.ONLINE,
    }),
  ],
  exports: [KeycloakConnectModule, KeycloakAdminService],
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
})
export class KeycloakModule {}
