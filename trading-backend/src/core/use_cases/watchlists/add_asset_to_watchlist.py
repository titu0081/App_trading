from src.core.exceptions import NotFoundError, UnauthorizedError
from src.core.ports.asset_repository import AssetRepositoryPort
from src.core.ports.watchlist_repository import WatchlistRepositoryPort


class AddAssetToWatchlistUseCase:
    def __init__(self, watchlist_repo: WatchlistRepositoryPort, asset_repo: AssetRepositoryPort):
        self.watchlist_repo = watchlist_repo
        self.asset_repo = asset_repo

    async def execute(self, user_id: str, watchlist_id: str, asset_id: str) -> None:
        watchlist = await self.watchlist_repo.get_by_id(watchlist_id)
        if watchlist is None:
            raise NotFoundError("watchlist not found")
        if watchlist.user_id != user_id:
            raise UnauthorizedError("you do not own this watchlist")

        asset = await self.asset_repo.find_by_id(asset_id)
        if asset is None:
            raise NotFoundError("asset not found")

        await self.watchlist_repo.add_asset(watchlist_id, asset_id)
