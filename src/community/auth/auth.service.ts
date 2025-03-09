import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakAdminService } from 'src/keycloak/admin/keycloak-admin.service';
import axios from 'axios';
import { PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

@Injectable()
export class AuthService {
  constructor(private readonly keycloakAdminService: KeycloakAdminService) {}

  async register(_register_auth_dto: RegisterAuthDTO) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_REALM,
    });
    try {
      const _response =
        await this.keycloakAdminService.register(_register_auth_dto);
      const _user = await keycloakAdmin.users.findOne({
        realm: process.env.KEYCLOAK_REALM,
        id: _response.id,
      });
      return _user;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async login(username: string, password: string) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_REALM,
    });
    try {
      await keycloakAdmin.auth({
        grantType: 'password',
        clientId: process.env.KEYCLOAK_CLIENT_ID!,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        username,
        password,
        scopes: ['openid', 'profile', 'email'],
      });

      const _userList = await keycloakAdmin.users.find({
        realm: process.env.KEYCLOAK_REALM,
        username,
      });
      const _user = _userList.length ? _userList[0] : null;
      const access_token = keycloakAdmin.accessToken;
      const refresh_token = keycloakAdmin.refreshToken;

      return {
        access_token,
        refresh_token,
        token_type: 'Bearer',
        scope: 'openid profile email',
        user: _user,
      };
    } catch (error) {
      throw new HttpException(
        `${error.message || JSON.stringify(error.response?.data)}`,
        error?.response?.status || 500,
      );
    }
  }

  async refresh(refresh_token: string, user?: any) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_REALM,
    });
    try {
      await keycloakAdmin.auth({
        grantType: 'refresh_token',
        clientId: process.env.KEYCLOAK_CLIENT_ID!,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        refreshToken: refresh_token,
      });
      const _access_token = keycloakAdmin.accessToken;
      const _refresh_token = keycloakAdmin.refreshToken;
      return {
        access_token: _access_token,
        refresh_token: _refresh_token,
        token_type: 'Bearer',
        scope: 'openid profile email',
        user,
      };
    } catch (error) {
      throw new HttpException(
        `${error.message || JSON.stringify(error.response?.data)}`,
        error?.response?.status || 500,
      );
    }
  }

  async logout(refresh_token: string) {
    const logoutUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;

    const params = new URLSearchParams();
    params.append('client_id', process.env.KEYCLOAK_CLIENT_ID!);
    params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET!);
    params.append('refresh_token', refresh_token);
    try {
      const response = await axios.post(logoutUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return { message: 'User logged out successfully', data: response.data };
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.error_description || 'Logout failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
