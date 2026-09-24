from unittest.mock import AsyncMock

import pytest

from src.api.dependencies import get_asset_repository, get_market_providers
from src.core.entities.asset import Asset
from src.core.exceptions import ExternalServiceError
from src.main import app


@pytest.mark.asyncio
async def test_history_endpoint_returns_normalized_provider_data(client, auth_headers):
    asset_repo = AsyncMock()
    asset_repo.find_by_symbol.return_value = Asset(
        id="a-1", symbol="AAPL", name="Apple", type="stock", source_api="finnhub"
    )
    provider = AsyncMock()
    provider.get_historical.return_value = [
        {"timestamp": 1_700_000_000, "price": 189.5, "volume": 10}
    ]
    app.dependency_overrides[get_asset_repository] = lambda: asset_repo
    app.dependency_overrides[get_market_providers] = lambda: {"finnhub": provider}

    try:
        response = await client.get(
            "/market/history/AAPL?interval=1W", headers=auth_headers
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == [
        {"timestamp": 1_700_000_000, "price": 189.5, "volume": 10}
    ]
    provider.get_historical.assert_awaited_once()


@pytest.mark.asyncio
async def test_history_endpoint_maps_provider_failure_to_bad_gateway(client, auth_headers):
    asset_repo = AsyncMock()
    asset_repo.find_by_symbol.return_value = Asset(
        id="a-1", symbol="AAPL", name="Apple", type="stock", source_api="finnhub"
    )
    provider = AsyncMock()
    provider.get_historical.side_effect = ExternalServiceError("provider unavailable")
    app.dependency_overrides[get_asset_repository] = lambda: asset_repo
    app.dependency_overrides[get_market_providers] = lambda: {"finnhub": provider}

    try:
        response = await client.get("/market/history/AAPL", headers=auth_headers)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 502
    assert response.json() == {"detail": "provider unavailable"}
