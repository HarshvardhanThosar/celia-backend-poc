import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { RegisterAuthDTO } from 'src/community/auth/dto/register-auth.dto';

@Injectable()
export class KeycloakAdminService {
  private keycloakAdmin: KeycloakAdminClient;

  constructor(private configService: ConfigService) {
    this.keycloakAdmin = new KeycloakAdminClient({
      baseUrl: this.configService.get<string>('KEYCLOAK_URL'),
      realmName: 'master',
    });
  }

  async authenticate_admin() {
    await this.keycloakAdmin.auth({
      grantType: 'password',
      clientId: 'admin-cli',
      username: this.configService.get<string>('KC_BOOTSTRAP_ADMIN_USERNAME'),
      password: this.configService.get<string>('KC_BOOTSTRAP_ADMIN_PASSWORD'),
    });
  }

  async register(_register_auth_dto: RegisterAuthDTO) {
    await this.authenticate_admin();
    try {
      const _response = await this.keycloakAdmin.users.create({
        realm: this.configService.get<string>('KEYCLOAK_REALM'),
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

  async assign_role(userId: string, roleName: string) {
    await this.authenticate_admin();
    const roles = await this.keycloakAdmin.roles.find({
      realm: this.configService.get<string>('KEYCLOAK_REALM'),
    });
    const role = roles.find((r) => r.name === roleName);
    if (!role) throw new Error(`Role '${roleName}' not found`);
    return this.keycloakAdmin.users.addRealmRoleMappings({
      realm: this.configService.get<string>('KEYCLOAK_REALM'),
      id: userId,
      roles: [{ id: role.id!, name: role.name! }],
    });
  }
}
