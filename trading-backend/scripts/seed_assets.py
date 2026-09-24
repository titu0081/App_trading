"""Seeds the financial_assets catalog with free-tier-compatible symbols.

- Stocks -> Finnhub free tier (US equities quotes).
- Crypto -> CoinGecko free tier (ids already mapped in CoinGeckoClient).

Idempotent: existing symbols are skipped. Run from trading-backend/:
    .\\venv\\Scripts\\python.exe scripts\\seed_assets.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from src.infrastructure.config import settings
from src.infrastructure.database.models import (
    ApiSource,
    AssetType,
    FinancialAssetModel,
)

STOCKS: list[tuple[str, str]] = [
    ("AAPL", "Apple Inc."),
    ("MSFT", "Microsoft Corp."),
    ("GOOGL", "Alphabet Inc."),
    ("AMZN", "Amazon.com Inc."),
    ("TSLA", "Tesla Inc."),
    ("NVDA", "NVIDIA Corp."),
    ("META", "Meta Platforms Inc."),
    ("NFLX", "Netflix Inc."),
    ("AMD", "Advanced Micro Devices Inc."),
    ("INTC", "Intel Corp."),
    ("JPM", "JPMorgan Chase & Co."),
    ("V", "Visa Inc."),
]

CRYPTOS: list[tuple[str, str]] = [
    ("BTC", "Bitcoin"),
    ("ETH", "Ethereum"),
    ("USDT", "Tether"),
    ("BNB", "BNB"),
    ("SOL", "Solana"),
    ("XRP", "XRP"),
    ("ADA", "Cardano"),
    ("DOGE", "Dogecoin"),
]


async def main() -> None:
    engine = create_async_engine(settings.database_url)
    try:
        async with AsyncSession(engine) as session:
            existing = set(
                (
                    await session.execute(select(FinancialAssetModel.symbol))
                ).scalars()
            )
            pending = [
                FinancialAssetModel(
                    symbol=symbol,
                    name=name,
                    type=asset_type,
                    source_api=source,
                )
                for asset_type, source, items in (
                    (AssetType.stock, ApiSource.finnhub, STOCKS),
                    (AssetType.crypto, ApiSource.coingecko, CRYPTOS),
                )
                for symbol, name in items
                if symbol not in existing
            ]
            session.add_all(pending)
            await session.commit()
            print(f"seed_assets: {len(pending)} inserted, {len(existing)} already existed")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
