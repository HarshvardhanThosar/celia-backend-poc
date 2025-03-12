import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { KeycloakAdminService } from 'src/keycloak/admin/keycloak-admin.service';
import axios from 'axios';
import { LogoutAuthDTO } from './dto/logout-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly keycloak_admin_service: KeycloakAdminService,
    private readonly config_service: ConfigService,
  ) {}

  async register(_register_auth_dto: RegisterAuthDTO) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.config_service.get<string>('KEYCLOAK_URL'),
      realmName: 'master',
    });

    try {
      const _response =
        await this.keycloak_admin_service.register(_register_auth_dto);

      if (!_response.id) {
        throw new HttpException(
          'User created but no ID returned',
          HttpStatus.BAD_REQUEST,
        );
      }

      await keycloakAdmin.auth({
        grantType: 'password',
        clientId: 'admin-cli',
        username: this.config_service.get<string>(
          'KC_BOOTSTRAP_ADMIN_USERNAME',
        ),
        password: this.config_service.get<string>(
          'KC_BOOTSTRAP_ADMIN_PASSWORD',
        ),
      });

      let _user;

      for (let i = 0; i < 3; i++) {
        _user = await keycloakAdmin.users.findOne({
          realm: this.config_service.get<string>('KEYCLOAK_REALM'),
          id: _response.id,
        });

        if (_user) break;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!_user) {
        throw new HttpException(
          'User not found after creation',
          HttpStatus.BAD_REQUEST,
        );
      }

      return _user;
    } catch (error) {
      this.logger.error(
        `Keycloak Register Error:`,
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.message || 'User registration failed',
        error?.response?.status || 500,
      );
    }
  }

  async login(_login_auth_dto: LoginAuthDTO) {
    const { username, password } = _login_auth_dto;

    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.config_service.get<string>('KEYCLOAK_URL'),
      realmName: this.config_service.get<string>('KEYCLOAK_REALM'),
    });

    try {
      await keycloakAdmin.auth({
        grantType: 'password',
        clientId: this.config_service.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'celia-auth-client',
        ),
        clientSecret: this.config_service.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
          'LjJH6RcoZ7q1dN4z1eg2BtFthFVo7yRG',
        ),
        username,
        password,
        scopes: ['openid', 'profile', 'email'],
      });

      // Fetch user details
      const _userList = await keycloakAdmin.users.find({
        realm: this.config_service.get<string>('KEYCLOAK_REALM'),
        username,
      });

      if (!_userList.length) {
        throw new HttpException(
          'User not found in Keycloak',
          HttpStatus.NOT_FOUND,
        );
      }

      const _user = _userList[0];

      return {
        access_token: keycloakAdmin.accessToken,
        refresh_token: keycloakAdmin.refreshToken,
        token_type: 'Bearer',
        scope: 'openid profile email',
        user: _user,
      };
    } catch (error) {
      this.logger.error('Login Error:', error.response?.data || error.message);
      if (
        error.response?.status === 401 ||
        error.response?.data?.error === 'invalid_grant'
      ) {
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        error.message || JSON.stringify(error.response?.data),
        error?.response?.status || 500,
      );
    }
  }

  async refresh(refresh_token: string, user?: any) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.config_service.get<string>('KEYCLOAK_URL'),
      realmName: this.config_service.get<string>('KEYCLOAK_REALM'),
    });

    try {
      await keycloakAdmin.auth({
        grantType: 'refresh_token',
        clientId: this.config_service.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'celia-auth-client',
        ),
        clientSecret: this.config_service.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
          'LjJH6RcoZ7q1dN4z1eg2BtFthFVo7yRG',
        ),
        refreshToken: refresh_token,
      });

      return {
        access_token: keycloakAdmin.accessToken,
        refresh_token: keycloakAdmin.refreshToken,
        token_type: 'Bearer',
        scope: 'openid profile email',
        user,
      };
    } catch (error) {
      this.logger.error(
        'Refresh Token Error:',
        error.response?.data || error.message,
      );

      // Handle specific token errors
      if (error.response?.status === 400) {
        if (error.response.data?.error === 'invalid_grant') {
          throw new HttpException(
            'Refresh token expired or invalid',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      throw new HttpException(
        error.message || JSON.stringify(error.response?.data),
        error?.response?.status || 500,
      );
    }
  }

  async logout(_log_out_dto: LogoutAuthDTO) {
    const { refresh_token } = _log_out_dto;
    const logoutUrl = `${this.config_service.get<string>('KEYCLOAK_URL')}/realms/${this.config_service.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/logout`;

    const params = new URLSearchParams();
    params.append(
      'client_id',
      this.config_service.get<string>(
        'KEYCLOAK_CLIENT_ID',
        'celia-auth-client',
      ),
    );
    params.append(
      'client_secret',
      this.config_service.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
        'LjJH6RcoZ7q1dN4z1eg2BtFthFVo7yRG',
      ),
    );
    params.append('refresh_token', refresh_token);

    try {
      const response = await axios.post(logoutUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.status === 204) {
        return { message: 'User logged out successfully' };
      }

      return { message: 'Logout response received', data: response.data };
    } catch (error) {
      this.logger.error('Logout error:', error.response?.data || error.message);

      if (
        error.response?.status === 400 &&
        error.response?.data?.error === 'invalid_token'
      ) {
        throw new HttpException(
          'Refresh token is invalid or expired',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        error.response?.data?.error_description || 'Logout failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
