from dataclasses import dataclass
from datetime import datetime

from src.core.exceptions import DomainError

VALID_ALERT_TYPES = {"price_target", "percent_variation", "indicator", "dividend"}
VALID_CONDITIONS = {"above", "below", "crosses_up", "crosses_down"}


@dataclass
class Alert:
    """Pure domain representation of a user_alerts row with trigger logic."""

    id: str | None
    user_id: str
    asset_id: str
    type: str
    condition: str | None
    target_value: float | None
    is_active: bool = True
    created_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.type not in VALID_ALERT_TYPES:
            raise DomainError(f"invalid alert type: {self.type}")
        if self.condition is not None and self.condition not in VALID_CONDITIONS:
            raise DomainError(f"invalid alert condition: {self.condition}")
        if self.target_value is not None and self.target_value < 0:
            raise DomainError("target_value must be non-negative")

    def is_triggered(self, current_price: float, previous_price: float | None = None) -> bool:
        if not self.is_active or self.target_value is None:
            return False
        if self.condition == "above":
            return current_price > self.target_value
        if self.condition == "below":
            return current_price < self.target_value
        if self.condition == "crosses_up":
            return previous_price is not None and previous_price <= self.target_value < current_price
        if self.condition == "crosses_down":
            return previous_price is not None and previous_price >= self.target_value > current_price
        return False
