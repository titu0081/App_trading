from src.core.exceptions import NotFoundError, UnauthorizedError
from src.core.ports.watchlist_repository import WatchlistRepositoryPort


class DeleteWatchlistUseCase:
    def __init__(self, watchlist_repo: WatchlistRepositoryPort):
        self.repo = watchlist_repo

    async def execute(self, user_id: str, watchlist_id: str) -> None:
        watchlist = await self.repo.get_by_id(watchlist_id)
        if watchlist is None:
            raise NotFoundError("watchlist not found")
        if watchlist.user_id != user_id:
            raise UnauthorizedError("you do not own this watchlist")
        await self.repo.delete(watchlist_id)
