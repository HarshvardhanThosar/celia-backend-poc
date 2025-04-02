import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString() @IsNotEmpty() env!: string;

  // PostgreSQL
  @IsString() @IsNotEmpty() postgres_db!: string;
  @IsString() @IsNotEmpty() postgres_user!: string;
  @IsString() @IsNotEmpty() postgres_password!: string;
  @IsNumber() postgres_port!: number;

  // Keycloak
  @IsString() @IsNotEmpty() keycloak_url!: string;
  @IsString() @IsNotEmpty() keycloak_realm!: string;
  @IsString() @IsNotEmpty() keycloak_client_id!: string;
  @IsString() @IsNotEmpty() keycloak_client_secret!: string;
  @IsString() @IsNotEmpty() kc_bootstrap_admin_username!: string;
  @IsString() @IsNotEmpty() kc_bootstrap_admin_password!: string;

  // MongoDB
  @IsString() @IsNotEmpty() mongo_host!: string;
  @IsString() @IsNotEmpty() mongo_username!: string;
  @IsString() @IsNotEmpty() mongo_password!: string;
  @IsString() @IsNotEmpty() mongo_cluster!: string;
  @IsString() @IsNotEmpty() mongo_database!: string;
}

@Injectable()
export class ConfigService {
  private readonly env_config: EnvironmentVariables;

  constructor(private nest_config_service: NestConfigService) {
    // Fetch individual values correctly
    const config = {
      env: this.nest_config_service.get<string>('ENV', 'dev'),

      // PostgreSQL
      postgres_db: this.nest_config_service.get<string>(
        'POSTGRES_DB',
        'keycloak',
      ),
      postgres_user: this.nest_config_service.get<string>(
        'POSTGRES_USER',
        'keycloak',
      ),
      postgres_password: this.nest_config_service.get<string>(
        'POSTGRES_PASSWORD',
        'keycloak',
      ),
      postgres_port: this.nest_config_service.get<number>(
        'POSTGRES_PORT',
        5432,
      ),

      // Keycloak
      keycloak_url: this.nest_config_service.get<string>(
        'KEYCLOAK_URL',
        'http://keycloak:8080',
      ),
      keycloak_realm: this.nest_config_service.get<string>(
        'KEYCLOAK_REALM',
        'celia-auth-realm',
      ),
      keycloak_client_id: this.nest_config_service.get<string>(
        'KEYCLOAK_CLIENT_ID',
        'celia-auth-client',
      ),
      keycloak_client_secret: this.nest_config_service.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
        'CQ8w2G4J6c5IzRalVMTunoGl7CpnTI2Z',
      ),
      kc_bootstrap_admin_username: this.nest_config_service.get<string>(
        'KC_BOOTSTRAP_ADMIN_USERNAME',
        'admin',
      ),
      kc_bootstrap_admin_password: this.nest_config_service.get<string>(
        'KC_BOOTSTRAP_ADMIN_PASSWORD',
        'admin',
      ),

      // MongoDB
      mongo_host: this.nest_config_service.get<string>('MONGO_HOST', ''),
      mongo_username: this.nest_config_service.get<string>(
        'MONGO_USERNAME',
        '',
      ),
      mongo_password: this.nest_config_service.get<string>(
        'MONGO_PASSWORD',
        '',
      ),
      mongo_cluster: this.nest_config_service.get<string>('MONGO_CLUSTER', ''),
      mongo_database: this.nest_config_service.get<string>(
        'MONGO_DATABASE',
        '',
      ),
    };

    // Validate the configuration
    const validatedConfig = plainToInstance(EnvironmentVariables, config);
    const errors = validateSync(validatedConfig);

    if (errors.length > 0) {
      throw new Error(
        `Invalid environment configuration: ${JSON.stringify(errors)}`,
      );
    }

    this.env_config = validatedConfig;
  }

  // Generic getter
  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    return this.env_config[key];
  }

  // Mongo URI Getter
  get mongo_uri(): string {
    return (
      `mongodb+srv://${this.env_config.mongo_username}:${this.env_config.mongo_password}` +
      `@${this.env_config.mongo_host}/?retryWrites=true&w=majority&appName=${this.env_config.mongo_cluster}`
    );
  }
}
