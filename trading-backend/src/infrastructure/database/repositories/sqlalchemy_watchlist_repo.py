from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.entities.watchlist import Watchlist
from src.core.ports.watchlist_repository import WatchlistRepositoryPort
from src.infrastructure.database.models import UserWatchlistModel, WatchlistAssetModel


def _to_entity(model: UserWatchlistModel) -> Watchlist:
    watchlist = Watchlist(
        id=str(model.id),
        user_id=str(model.user_id),
        name=model.name,
        created_at=model.created_at,
    )
    watchlist.asset_ids = [str(a.asset_id) for a in model.assets]
    return watchlist


class SqlAlchemyWatchlistRepository(WatchlistRepositoryPort):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save(self, watchlist: Watchlist) -> Watchlist:
        model = UserWatchlistModel(user_id=watchlist.user_id, name=watchlist.name)
        self.session.add(model)
        await self.session.flush()
        model.assets = []
        return _to_entity(model)

    async def get_by_id(self, watchlist_id: str) -> Watchlist | None:
        result = await self.session.execute(
            select(UserWatchlistModel)
            .options(selectinload(UserWatchlistModel.assets))
            .where(UserWatchlistModel.id == watchlist_id)
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def get_by_user(self, user_id: str) -> list[Watchlist]:
        result = await self.session.execute(
            select(UserWatchlistModel)
            .options(selectinload(UserWatchlistModel.assets))
            .where(UserWatchlistModel.user_id == user_id)
        )
        return [_to_entity(m) for m in result.scalars().all()]

    async def delete(self, watchlist_id: str) -> None:
        model = await self.session.get(UserWatchlistModel, watchlist_id)
        if model:
            await self.session.delete(model)
            await self.session.flush()

    async def add_asset(self, watchlist_id: str, asset_id: str) -> None:
        link = WatchlistAssetModel(watchlist_id=watchlist_id, asset_id=asset_id)
        self.session.add(link)
        await self.session.flush()

    async def remove_asset(self, watchlist_id: str, asset_id: str) -> None:
        result = await self.session.execute(
            select(WatchlistAssetModel).where(
                WatchlistAssetModel.watchlist_id == watchlist_id,
                WatchlistAssetModel.asset_id == asset_id,
            )
        )
        link = result.scalar_one_or_none()
        if link:
            await self.session.delete(link)
            await self.session.flush()
