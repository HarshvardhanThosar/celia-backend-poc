import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { KeycloakAdminService } from 'src/keycloak/admin/keycloak-admin.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly keycloakAdminService: KeycloakAdminService,
    private readonly configService: ConfigService,
  ) {}

  async register(_register_auth_dto: RegisterAuthDTO) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.configService.get<string>('KEYCLOAK_URL'),
      realmName: this.configService.get<string>('KEYCLOAK_REALM'),
    });

    try {
      this.logger.log(
        `🔍 Registering user in Keycloak: ${_register_auth_dto.username}`,
      );

      // ✅ Step 1: Create User
      const _response =
        await this.keycloakAdminService.register(_register_auth_dto);

      if (!_response.id) {
        throw new HttpException(
          'User created but no ID returned',
          HttpStatus.BAD_REQUEST,
        );
      }

      // ✅ Step 2: Authenticate Admin before fetching user details
      this.logger.log(`🔑 Authenticating admin to fetch user details...`);
      await keycloakAdmin.auth({
        grantType: 'password',
        clientId: 'admin-cli',
        username: this.configService.get<string>('KC_BOOTSTRAP_ADMIN_USERNAME'),
        password: this.configService.get<string>('KC_BOOTSTRAP_ADMIN_PASSWORD'),
      });

      // ✅ Step 3: Fetch newly created user details
      this.logger.log(`🔍 Fetching user details from Keycloak...`);
      const _user = await keycloakAdmin.users.findOne({
        realm: this.configService.get<string>('KEYCLOAK_REALM'),
        id: _response.id,
      });

      if (!_user) {
        throw new HttpException(
          'User not found after creation',
          HttpStatus.BAD_REQUEST,
        );
      }

      return _user;
    } catch (error) {
      this.logger.error(
        `❌ Keycloak Register Error:`,
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.message || 'User registration failed',
        error?.response?.status || 500,
      );
    }
  }

  async login(username: string, password: string) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.configService.get<string>('KEYCLOAK_URL'),
      realmName: this.configService.get<string>('KEYCLOAK_REALM'),
    });

    try {
      await keycloakAdmin.auth({
        grantType: 'password',
        clientId: this.configService.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'celia-auth-client',
        ),
        clientSecret: this.configService.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
          'LjJH6RcoZ7q1dN4z1eg2BtFthFVo7yRG',
        ),
        username,
        password,
        scopes: ['openid', 'profile', 'email'],
      });

      const _userList = await keycloakAdmin.users.find({
        realm: this.configService.get<string>('KEYCLOAK_REALM'),
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
      this.logger.error(
        `❌ Login Error:`,
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.message || JSON.stringify(error.response?.data),
        error?.response?.status || 500,
      );
    }
  }

  async refresh(refresh_token: string, user?: any) {
    const keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.configService.get<string>('KEYCLOAK_URL'),
      realmName: this.configService.get<string>('KEYCLOAK_REALM'),
    });

    try {
      await keycloakAdmin.auth({
        grantType: 'refresh_token',
        clientId: this.configService.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'celia-auth-client',
        ),
        clientSecret: this.configService.get<string>(
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
        `❌ Refresh Token Error:`,
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.message || JSON.stringify(error.response?.data),
        error?.response?.status || 500,
      );
    }
  }

  async logout(refresh_token: string) {
    const logoutUrl = `${this.configService.get<string>('KEYCLOAK_URL')}/realms/${this.configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/logout`;

    const params = new URLSearchParams();
    params.append(
      'client_id',
      this.configService.get<string>('KEYCLOAK_CLIENT_ID', 'celia-auth-client'),
    );
    params.append(
      'client_secret',
      this.configService.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
        'LjJH6RcoZ7q1dN4z1eg2BtFthFVo7yRG',
      ),
    );
    params.append('refresh_token', refresh_token);

    try {
      const response = await axios.post(logoutUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return { message: 'User logged out successfully', data: response.data };
    } catch (error) {
      this.logger.error('Logout error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.error_description || 'Logout failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
