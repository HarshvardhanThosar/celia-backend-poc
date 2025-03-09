import { Injectable } from '@nestjs/common';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { RegisterAuthDTO } from 'src/community/auth/dto/register-auth.dto';

@Injectable()
export class KeycloakAdminService {
  private keycloakAdmin: KeycloakAdminClient;

  constructor() {
    this.keycloakAdmin = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_REALM,
    });
  }

  async authenticateAdmin() {
    await this.keycloakAdmin.auth({
      grantType: 'password',
      clientId: 'admin-cli',
      username: process.env.KC_BOOTSTRAP_ADMIN_USERNAME,
      password: process.env.KC_BOOTSTRAP_ADMIN_PASSWORD,
    });
  }

  async register(_register_auth_dto: RegisterAuthDTO) {
    await this.authenticateAdmin();
    return this.keycloakAdmin.users.create({
      realm: process.env.KEYCLOAK_REALM,
      username: _register_auth_dto.username,
      email: _register_auth_dto.email,
      firstName: _register_auth_dto.first_name,
      lastName: _register_auth_dto.last_name,
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
  }

  async assignRole(userId: string, roleName: string) {
    await this.authenticateAdmin();
    const roles = await this.keycloakAdmin.roles.find({
      realm: process.env.KEYCLOAK_REALM,
    });
    const role = roles.find((r) => r.name === roleName);
    if (!role) throw new Error(`Role '${roleName}' not found`);
    return this.keycloakAdmin.users.addRealmRoleMappings({
      realm: process.env.KEYCLOAK_REALM,
      id: userId,
      roles: [{ id: role.id!, name: role.name! }],
    });
  }
}
