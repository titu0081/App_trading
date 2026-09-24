from abc import ABC, abstractmethod
from datetime import datetime


class MarketDataProviderPort(ABC):
    """Common interface implemented by external market data adapters (Finnhub, CoinGecko)."""

    @abstractmethod
    async def get_price(self, symbol: str) -> float: ...

    @abstractmethod
    async def get_historical(self, symbol: str, start: datetime, end: datetime) -> list[dict]: ...
