from datetime import datetime, timedelta, timezone

from src.core.exceptions import DomainError, NotFoundError
from src.core.ports.asset_repository import AssetRepositoryPort
from src.core.ports.market_data_provider import MarketDataProviderPort


_INTERVAL_DAYS = {"1D": 1, "1W": 7, "1M": 30, "1Y": 365}


class FetchHistoricalPricesUseCase:
    def __init__(
        self,
        asset_repo: AssetRepositoryPort,
        providers: dict[str, MarketDataProviderPort],
    ):
        self.asset_repo = asset_repo
        self.providers = providers

    async def execute(
        self, symbol: str, interval: str, now: datetime | None = None
    ) -> list[dict]:
        days = _INTERVAL_DAYS.get(interval)
        if days is None:
            raise DomainError(f"unsupported market interval: {interval}")

        asset = await self.asset_repo.find_by_symbol(symbol)
        if asset is None:
            raise NotFoundError(f"asset not found: {symbol}")

        provider = self.providers.get(asset.source_api)
        if provider is None:
            raise NotFoundError(f"no provider configured for source_api: {asset.source_api}")

        end = now or datetime.now(timezone.utc)
        start = end - timedelta(days=days)
        return await provider.get_historical(asset.symbol, start, end)