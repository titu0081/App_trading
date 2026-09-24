from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from src.core.entities.asset import Asset
from src.core.exceptions import DomainError
from src.core.use_cases.market.fetch_historical_prices import FetchHistoricalPricesUseCase


class TestFetchHistoricalPricesUseCase:
    @pytest.mark.asyncio
    async def test_uses_asset_provider_and_requested_interval(self):
        asset_repo = AsyncMock()
        asset_repo.find_by_symbol.return_value = Asset(
            id="a-1", symbol="AAPL", name="Apple", type="stock", source_api="finnhub"
        )
        provider = AsyncMock()
        provider.get_historical.return_value = [
            {"timestamp": 1_700_000_000, "price": 189.5, "volume": 10}
        ]
        now = datetime(2026, 9, 16, tzinfo=timezone.utc)

        result = await FetchHistoricalPricesUseCase(
            asset_repo, {"finnhub": provider}
        ).execute("aapl", "1W", now=now)

        assert result == [{"timestamp": 1_700_000_000, "price": 189.5, "volume": 10}]
        provider.get_historical.assert_awaited_once_with(
            "AAPL", datetime(2026, 9, 9, tzinfo=timezone.utc), now
        )

    @pytest.mark.asyncio
    async def test_rejects_an_unsupported_interval(self):
        use_case = FetchHistoricalPricesUseCase(AsyncMock(), {})

        with pytest.raises(DomainError, match="unsupported market interval"):
            await use_case.execute("AAPL", "5Y")
