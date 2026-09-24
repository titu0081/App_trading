from src.core.entities.watchlist import Watchlist
from src.core.exceptions import DomainError
from src.core.ports.watchlist_repository import WatchlistRepositoryPort


class CreateWatchlistUseCase:
    def __init__(self, watchlist_repo: WatchlistRepositoryPort):
        self.repo = watchlist_repo

    async def execute(self, user_id: str, name: str) -> Watchlist:
        if not name or not name.strip():
            raise DomainError("name cannot be empty")

        watchlist = Watchlist(id=None, user_id=user_id, name=name.strip())
        return await self.repo.save(watchlist)
