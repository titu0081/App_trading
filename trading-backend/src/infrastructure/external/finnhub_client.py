from datetime import datetime

import httpx

from src.core.exceptions import ExternalServiceError
from src.core.ports.market_data_provider import MarketDataProviderPort
from src.infrastructure.config import settings
from src.infrastructure.external.rate_limiter import RateLimiter

BASE_URL = "https://finnhub.io/api/v1"


class FinnhubClient(MarketDataProviderPort):
    """Adapter for stocks/indices/forex via Finnhub."""

    def __init__(self, api_key: str | None = None, rate_limiter: RateLimiter | None = None):
        self.api_key = api_key or settings.finnhub_api_key
        # Free tier: 60 calls/minute.
        self.rate_limiter = rate_limiter or RateLimiter(max_calls=60, period=60.0)

    async def get_price(self, symbol: str) -> float:
        await self.rate_limiter.acquire()
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{BASE_URL}/quote",
                    params={"symbol": symbol, "token": self.api_key},
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise ExternalServiceError(f"Finnhub request failed for {symbol}: {exc}") from exc

            data = response.json()
            price = data.get("c")
            if price is None:
                raise ExternalServiceError(f"Finnhub returned no price for {symbol}")
            return float(price)

    async def get_historical(self, symbol: str, start: datetime, end: datetime) -> list[dict]:
        await self.rate_limiter.acquire()
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{BASE_URL}/stock/candle",
                    params={
                        "symbol": symbol,
                        "resolution": "D",
                        "from": int(start.timestamp()),
                        "to": int(end.timestamp()),
                        "token": self.api_key,
                    },
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise ExternalServiceError(
                    f"Finnhub historical request failed for {symbol}: {exc}"
                ) from exc

            data = response.json()
            if data.get("s") != "ok":
                return []

            return [
                {"timestamp": ts, "price": price, "volume": vol}
                for ts, price, vol in zip(data.get("t", []), data.get("c", []), data.get("v", []))
            ]
