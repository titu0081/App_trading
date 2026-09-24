from src.core.entities.watchlist import Watchlist
from src.core.ports.watchlist_repository import WatchlistRepositoryPort


class ListUserWatchlistsUseCase:
    def __init__(self, watchlist_repo: WatchlistRepositoryPort):
        self.repo = watchlist_repo

    async def execute(self, user_id: str) -> list[Watchlist]:
        return await self.repo.get_by_user(user_id)
