import { Injectable } from '@nestjs/common';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakAdminService } from 'src/keycloak/admin/keycloak-admin.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private readonly keycloakAdminService: KeycloakAdminService) {}

  async register(registerAuthDto: RegisterAuthDTO) {
    return this.keycloakAdminService.register(registerAuthDto);
  }

  async login(username: string, password: string) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_REALM,
    });

    return keycloakAdmin.auth({
      grantType: 'password',
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      username,
      password,
    });
  }

  async refreshToken(refreshToken: string) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_REALM,
    });

    return keycloakAdmin.auth({
      grantType: 'refresh_token',
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      refreshToken,
    });
  }

  async logout(refreshToken: string) {
    const logoutUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;

    await axios.post(
      logoutUrl,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return { message: 'User logged out successfully' };
  }
}
