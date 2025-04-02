import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { RegisterAuthDTO } from 'src/community/auth/dto/register-auth.dto';

@Injectable()
export class KeycloakAdminService {
  private keycloakAdmin: KeycloakAdminClient;

  constructor(private config_service: ConfigService) {
    this.keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.config_service.get<string>('KEYCLOAK_URL'),
      realmName: 'master',
    });
  }

  async authenticate_admin() {
    await this.keycloakAdmin.auth({
      grantType: 'password',
      clientId: 'admin-cli',
      username: this.config_service.get<string>('KC_BOOTSTRAP_ADMIN_USERNAME'),
      password: this.config_service.get<string>('KC_BOOTSTRAP_ADMIN_PASSWORD'),
    });
  }

  async register(_register_auth_dto: RegisterAuthDTO) {
    await this.authenticate_admin();
    try {
      const _response = await this.keycloakAdmin.users.create({
        realm: this.config_service.get<string>('KEYCLOAK_REALM'),
        username: _register_auth_dto.username,
        email: _register_auth_dto.email,
        firstName: _register_auth_dto.firstName,
        lastName: _register_auth_dto.lastName,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: 'password',
            value: _register_auth_dto.password,
            temporary: false,
          },
        ],
      });
      return _response;
    } catch (error) {
      throw {
        statusCode: error?.response?.status || 500,
        message: `${error.message || JSON.stringify(error.response?.data)}`,
      };
    }
  }

  async get_user_by_id(user_id: string) {
    await this.authenticate_admin();
    return this.keycloakAdmin.users.findOne({
      id: user_id,
      realm: this.config_service.get<string>('KEYCLOAK_REALM'),
    });
  }
}
