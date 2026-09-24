from typing import AsyncGenerator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import PyJWTError
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.config import settings
from src.infrastructure.database.connection import async_session_factory
from src.infrastructure.database.repositories.sqlalchemy_alert_repo import SqlAlchemyAlertRepository
from src.infrastructure.database.repositories.sqlalchemy_asset_repo import SqlAlchemyAssetRepository
from src.infrastructure.database.repositories.sqlalchemy_notification_repo import (
    SqlAlchemyNotificationRepository,
)
from src.infrastructure.database.repositories.sqlalchemy_watchlist_repo import (
    SqlAlchemyWatchlistRepository,
)
from src.infrastructure.external.coingecko_client import CoinGeckoClient
from src.infrastructure.external.finnhub_client import FinnhubClient

security = HTTPBearer()
jwks_client = PyJWKClient(settings.supabase_jwks_url)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Request-scoped session. Commits on success, rolls back on any exception."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Extrae y valida el user_id desde el JWT de Supabase."""
    token = credentials.credentials
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token sin subject")
        return user_id
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )


def get_asset_repository(session: AsyncSession = Depends(get_db)) -> SqlAlchemyAssetRepository:
    return SqlAlchemyAssetRepository(session)


def get_watchlist_repository(session: AsyncSession = Depends(get_db)) -> SqlAlchemyWatchlistRepository:
    return SqlAlchemyWatchlistRepository(session)


def get_alert_repository(session: AsyncSession = Depends(get_db)) -> SqlAlchemyAlertRepository:
    return SqlAlchemyAlertRepository(session)


def get_notification_repository(
    session: AsyncSession = Depends(get_db),
) -> SqlAlchemyNotificationRepository:
    return SqlAlchemyNotificationRepository(session)


def get_market_providers() -> dict:
    return {"finnhub": FinnhubClient(), "coingecko": CoinGeckoClient()}
