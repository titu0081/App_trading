from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.entities.asset import Asset
from src.core.ports.asset_repository import AssetRepositoryPort
from src.infrastructure.database.models import FinancialAssetModel


def _to_entity(model: FinancialAssetModel) -> Asset:
    return Asset(
        id=str(model.id),
        symbol=model.symbol,
        name=model.name,
        type=model.type.value,
        source_api=model.source_api.value,
        created_at=model.created_at,
    )


class SqlAlchemyAssetRepository(AssetRepositoryPort):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_by_symbol(self, symbol: str) -> Asset | None:
        result = await self.session.execute(
            select(FinancialAssetModel).where(FinancialAssetModel.symbol == symbol.upper())
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def find_by_id(self, asset_id: str) -> Asset | None:
        model = await self.session.get(FinancialAssetModel, asset_id)
        return _to_entity(model) if model else None

    async def list_all(self, asset_type: str | None = None) -> list[Asset]:
        query = select(FinancialAssetModel)
        if asset_type:
            query = query.where(FinancialAssetModel.type == asset_type)
        result = await self.session.execute(query)
        return [_to_entity(m) for m in result.scalars().all()]

    async def save(self, asset: Asset) -> Asset:
        model = FinancialAssetModel(
            symbol=asset.symbol,
            name=asset.name,
            type=asset.type,
            source_api=asset.source_api,
        )
        self.session.add(model)
        await self.session.flush()
        return _to_entity(model)
