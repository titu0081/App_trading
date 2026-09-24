import os
import uuid
from unittest.mock import Mock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("SUPABASE_JWKS_URL", "https://example.supabase.co/auth/v1/.well-known/jwks.json")
os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/test_infinance"
)

from src.main import app  # noqa: E402  (env vars must be set before import)
from src.api import dependencies  # noqa: E402


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def user_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def auth_headers(monkeypatch, user_id) -> dict[str, str]:
    signing_key = Mock(key="public-key")
    monkeypatch.setattr(
        dependencies.jwks_client,
        "get_signing_key_from_jwt",
        Mock(return_value=signing_key),
    )
    monkeypatch.setattr(
        dependencies.jwt,
        "decode",
        Mock(return_value={"sub": user_id, "aud": "authenticated"}),
    )
    return {"Authorization": "Bearer signed.jwt.token"}
