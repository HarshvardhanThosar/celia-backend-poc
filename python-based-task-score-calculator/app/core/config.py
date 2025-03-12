import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV: str

    # PostgreSQL (Keycloak)
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_PORT: str

    # Keycloak Configuration
    KC_DB_URL: str
    KC_DB_USERNAME: str
    KC_DB_PASSWORD: str
    KC_BOOTSTRAP_ADMIN_USERNAME: str
    KC_BOOTSTRAP_ADMIN_PASSWORD: str
    KEYCLOAK_PORT: str
    KEYCLOAK_URL: str
    KEYCLOAK_REALM: str
    KEYCLOAK_CLIENT_ID: str
    KEYCLOAK_CLIENT_SECRET: str

    # MongoDB Configuration
    MONGO_HOST: str
    MONGO_USERNAME: str
    MONGO_PASSWORD: str
    MONGO_CLUSTER: str
    MONGO_DATABASE: str
    MONGO_URI: str  # Directly taken from the .env

    # Application Ports
    FASTAPI_PORT: int
    NESTJS_PORT: int

    # Load the `.env` file from the root if available
    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parents[2] / ".env", env_file_encoding="utf-8")

settings = Settings()