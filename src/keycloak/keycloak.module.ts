import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

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
    }),
  ],
  exports: [KeycloakConnectModule],
})
export class KeycloakModule {}
