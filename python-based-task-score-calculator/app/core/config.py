from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict

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
    MONGO_URI: str  # MONGO_URI is directly taken from the .env

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()