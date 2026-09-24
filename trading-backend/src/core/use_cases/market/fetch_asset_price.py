from src.core.exceptions import NotFoundError
from src.core.ports.asset_repository import AssetRepositoryPort
from src.core.ports.market_data_provider import MarketDataProviderPort


class FetchAssetPriceUseCase:
    """Resolves the correct market data adapter based on the asset's source_api."""

    def __init__(
        self,
        asset_repo: AssetRepositoryPort,
        providers: dict[str, MarketDataProviderPort],
    ):
        self.asset_repo = asset_repo
        self.providers = providers

    async def execute(self, symbol: str) -> float:
        asset = await self.asset_repo.find_by_symbol(symbol)
        if asset is None:
            raise NotFoundError(f"asset not found: {symbol}")

        provider = self.providers.get(asset.source_api)
        if provider is None:
            raise NotFoundError(f"no provider configured for source_api: {asset.source_api}")

        return await provider.get_price(asset.symbol)
