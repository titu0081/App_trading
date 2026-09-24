from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "InFinance API"
    app_version: str = "1.0.0"
    debug: bool = False
    port: int = 8000

    # --- Supabase Auth (validación JWT local) ---
    supabase_url: str = ""
    supabase_jwks_url: str = ""

    # --- Base de datos (SQLAlchemy async, service_role -> bypass RLS) ---
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

    # --- APIs externas ---
    finnhub_api_key: str = ""
    coingecko_api_key: str = ""

    # --- Celery / Redis ---
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    # --- CORS ---
    cors_origins: list[str] = ["*"]

    # --- Logging ---
    log_level: str = "INFO"

    @field_validator("database_url", mode="before")
    @classmethod
    def use_asyncpg_driver(cls, value: str) -> str:
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value


settings = Settings()
