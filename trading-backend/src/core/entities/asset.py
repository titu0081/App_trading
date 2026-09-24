from dataclasses import dataclass
from datetime import datetime

from src.core.exceptions import DomainError

VALID_ASSET_TYPES = {"stock", "crypto", "forex", "index"}
VALID_API_SOURCES = {"finnhub", "coingecko", "alphavantage", "twelvedata"}


@dataclass
class Asset:
    """Pure domain representation of a financial_assets row."""

    id: str | None
    symbol: str
    name: str
    type: str
    source_api: str
    created_at: datetime | None = None

    def __post_init__(self) -> None:
        if not self.symbol or not self.symbol.strip():
            raise DomainError("symbol cannot be empty")
        if self.type not in VALID_ASSET_TYPES:
            raise DomainError(f"invalid asset type: {self.type}")
        if self.source_api not in VALID_API_SOURCES:
            raise DomainError(f"invalid source_api: {self.source_api}")
        self.symbol = self.symbol.strip().upper()
