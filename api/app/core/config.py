from functools import lru_cache
from typing import Literal
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/design_picker"
    database_sync_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/design_picker"

    # Security
    secret_key: str = "dev-secret-key-change-in-production-must-be-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # App
    environment: Literal["development", "production", "test"] = "development"
    frontend_url: str = "http://localhost:3000"

    # Uploads
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 10

    # Email
    email_backend: Literal["console", "smtp"] = "console"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@studio.local"

    # Telegram
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    @field_validator("secret_key")
    @classmethod
    def secret_key_min_length(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
