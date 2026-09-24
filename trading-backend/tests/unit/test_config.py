from src.infrastructure.config import Settings


def test_postgresql_database_url_uses_asyncpg_driver():
    settings = Settings(
        database_url="postgresql://user:password@db.example.com:5432/postgres?sslmode=require"
    )

    assert settings.database_url == (
        "postgresql+asyncpg://user:password@db.example.com:5432/postgres?sslmode=require"
    )