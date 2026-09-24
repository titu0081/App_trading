from datetime import datetime

import httpx

from src.core.exceptions import ExternalServiceError
from src.core.ports.market_data_provider import MarketDataProviderPort
from src.infrastructure.config import settings
from src.infrastructure.external.rate_limiter import RateLimiter

BASE_URL = "https://api.coingecko.com/api/v3"

# CoinGecko usa IDs propios (ej. 'bitcoin') en vez de tickers ('BTC').
_SYMBOL_TO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "USDT": "tether",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
}


class CoinGeckoClient(MarketDataProviderPort):
    """Adapter for cryptocurrencies via CoinGecko."""

    def __init__(self, api_key: str | None = None, rate_limiter: RateLimiter | None = None):
        self.api_key = api_key or settings.coingecko_api_key
        # Free tier: ~10-30 calls/minute depending on plan.
        self.rate_limiter = rate_limiter or RateLimiter(max_calls=10, period=60.0)

    def _resolve_id(self, symbol: str) -> str:
        return _SYMBOL_TO_ID.get(symbol.upper(), symbol.lower())

    async def get_price(self, symbol: str) -> float:
        await self.rate_limiter.acquire()
        coin_id = self._resolve_id(symbol)
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{BASE_URL}/simple/price",
                    params={"ids": coin_id, "vs_currencies": "usd"},
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise ExternalServiceError(f"CoinGecko request failed for {symbol}: {exc}") from exc

            data = response.json()
            price = data.get(coin_id, {}).get("usd")
            if price is None:
                raise ExternalServiceError(f"CoinGecko returned no price for {symbol}")
            return float(price)

    async def get_historical(self, symbol: str, start: datetime, end: datetime) -> list[dict]:
        await self.rate_limiter.acquire()
        coin_id = self._resolve_id(symbol)
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{BASE_URL}/coins/{coin_id}/market_chart/range",
                    params={
                        "vs_currency": "usd",
                        "from": int(start.timestamp()),
                        "to": int(end.timestamp()),
                    },
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise ExternalServiceError(
                    f"CoinGecko historical request failed for {symbol}: {exc}"
                ) from exc

            data = response.json()
            return [
                {"timestamp": ts / 1000, "price": price, "volume": None}
                for ts, price in data.get("prices", [])
            ]
