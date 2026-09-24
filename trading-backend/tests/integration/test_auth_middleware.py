import pytest
from unittest.mock import Mock

from src.api import dependencies


class TestAuthMiddleware:
    @pytest.mark.asyncio
    async def test_protected_route_requires_auth(self, client):
        response = await client.post("/watchlists", json={"name": "Crypto"})
        assert response.status_code == 401  # HTTPBearer: no credentials supplied

    @pytest.mark.asyncio
    async def test_invalid_token_rejected(self, client):
        response = await client.get(
            "/auth/me", headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_valid_jwks_token_returns_user_id(self, client, monkeypatch, user_id):
        signing_key = Mock(key="public-key")
        jwks_client = Mock()
        jwks_client.get_signing_key_from_jwt.return_value = signing_key
        decode = Mock(return_value={"sub": user_id, "aud": "authenticated"})
        monkeypatch.setattr(dependencies, "jwks_client", jwks_client, raising=False)
        monkeypatch.setattr(dependencies.jwt, "decode", decode)

        response = await client.get(
            "/auth/me", headers={"Authorization": "Bearer signed.jwt.token"}
        )

        assert response.status_code == 200
        assert response.json() == {"user_id": user_id}
        jwks_client.get_signing_key_from_jwt.assert_called_once_with("signed.jwt.token")
        decode.assert_called_once_with(
            "signed.jwt.token",
            "public-key",
            algorithms=["RS256", "ES256"],
            audience="authenticated",
        )
