from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.infrastructure.config import settings
from src.shared.logger import logger

engine = create_async_engine(settings.database_url, echo=settings.debug, pool_pre_ping=True)

async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def test_connection() -> None:
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        logger.info("Database connection successful")
    except Exception as exc:
        # No loguear la excepción completa: asyncpg incluye la URL con la contraseña.
        logger.error(f"Database connection failed: {type(exc).__name__}")
        raise

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
