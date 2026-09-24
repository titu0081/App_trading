from dataclasses import dataclass, field
from datetime import datetime

from src.core.exceptions import DomainError


@dataclass
class Watchlist:
    """Pure domain representation of a user_watchlists row plus its asset ids."""

    id: str | None
    user_id: str
    name: str
    created_at: datetime | None = None
    asset_ids: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise DomainError("name cannot be empty")
        self.name = self.name.strip()

    def has_asset(self, asset_id: str) -> bool:
        return asset_id in self.asset_ids

    def add_asset(self, asset_id: str) -> None:
        if self.has_asset(asset_id):
            raise DomainError("asset already in watchlist")
        self.asset_ids.append(asset_id)

    def remove_asset(self, asset_id: str) -> None:
        if not self.has_asset(asset_id):
            raise DomainError("asset not in watchlist")
        self.asset_ids.remove(asset_id)
