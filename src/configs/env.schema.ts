import { IsString, IsNumber, IsNotEmpty, IsUrl } from 'class-validator';

export class EnvSchema {
  @IsNumber()
  PORT: number;

  // PostgreSQL
  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  @IsNumber()
  POSTGRES_PORT: number;

  // Keycloak
  @IsUrl()
  KEYCLOAK_URL: string;

  @IsString()
  KEYCLOAK_REALM: string;

  @IsString()
  KEYCLOAK_CLIENT_ID: string;

  @IsString()
  KEYCLOAK_CLIENT_SECRET: string;

  @IsString()
  KC_BOOTSTRAP_ADMIN_USERNAME: string;

  @IsString()
  KC_BOOTSTRAP_ADMIN_PASSWORD: string;

  // MongoDB
  @IsString()
  MONGO_HOST: string;

  @IsString()
  MONGO_USERNAME: string;

  @IsString()
  MONGO_PASSWORD: string;

  @IsString()
  MONGO_CLUSTER: string;

  @IsString()
  MONGO_DATABASE: string;

  @IsString()
  MONGO_URI: string;
}
