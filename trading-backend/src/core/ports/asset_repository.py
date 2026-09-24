from abc import ABC, abstractmethod

from src.core.entities.asset import Asset


class AssetRepositoryPort(ABC):
    """Port for accessing the global financial_assets catalog."""

    @abstractmethod
    async def find_by_symbol(self, symbol: str) -> Asset | None: ...

    @abstractmethod
    async def find_by_id(self, asset_id: str) -> Asset | None: ...

    @abstractmethod
    async def list_all(self, asset_type: str | None = None) -> list[Asset]: ...

    @abstractmethod
    async def save(self, asset: Asset) -> Asset: ...
