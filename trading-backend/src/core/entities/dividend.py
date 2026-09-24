from dataclasses import dataclass
from datetime import date, datetime

from src.core.exceptions import DomainError


@dataclass
class Dividend:
    """Pure domain representation of an asset_dividends row."""

    id: str | None
    asset_id: str
    amount: float
    pay_date: date
    ex_dividend_date: date
    yield_value: float | None = None
    created_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise DomainError("amount must be non-negative")
        if self.yield_value is not None and self.yield_value < 0:
            raise DomainError("yield_value must be non-negative")
