"""Application settings, loaded from environment variables (and `backend/.env` locally)."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Literal["development", "production", "test"] = "production"

    # Database
    mongo_url: SecretStr
    db_name: str = Field(min_length=1)

    # Auth
    secret_key: SecretStr
    access_token_expire_minutes: int = Field(default=12 * 60, ge=5, le=7 * 24 * 60)

    # Comma-separated list of allowed browser origins, e.g. "https://oxyssstyle.ro,https://www.oxyssstyle.ro"
    cors_origins: str = ""

    # Header set by the reverse proxy that carries the real client IP (Fly.io: "Fly-Client-IP").
    # Leave empty when not running behind a trusted proxy, otherwise clients could spoof it.
    client_ip_header: str = ""

    # Outgoing e-mail (booking confirmations). Sending is skipped when not configured.
    email_host: str = "smtp.gmail.com"
    email_port: int = 587
    email_username: str = ""
    email_password: SecretStr = SecretStr("")
    email_from: str = ""

    # Google Places (reviews widget). The endpoint returns 503 when not configured.
    google_api_key: SecretStr = SecretStr("")
    google_place_id: str = ""

    @field_validator("secret_key")
    @classmethod
    def _secret_key_strength(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters (use `openssl rand -hex 32`)")
        return value

    @field_validator("cors_origins")
    @classmethod
    def _no_wildcard_origin(cls, value: str) -> str:
        if "*" in value:
            raise ValueError("CORS_ORIGINS must list explicit origins; '*' is not allowed")
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def email_enabled(self) -> bool:
        return bool(self.email_from and self.email_username and self.email_password.get_secret_value())

    @property
    def google_reviews_enabled(self) -> bool:
        return bool(self.google_api_key.get_secret_value() and self.google_place_id)


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from the environment
