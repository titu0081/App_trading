from abc import ABC, abstractmethod

from src.core.entities.watchlist import Watchlist


class WatchlistRepositoryPort(ABC):
    """Port for persisting user watchlists and their asset associations."""

    @abstractmethod
    async def save(self, watchlist: Watchlist) -> Watchlist: ...

    @abstractmethod
    async def get_by_id(self, watchlist_id: str) -> Watchlist | None: ...

    @abstractmethod
    async def get_by_user(self, user_id: str) -> list[Watchlist]: ...

    @abstractmethod
    async def delete(self, watchlist_id: str) -> None: ...

    @abstractmethod
    async def add_asset(self, watchlist_id: str, asset_id: str) -> None: ...

    @abstractmethod
    async def remove_asset(self, watchlist_id: str, asset_id: str) -> None: ...
