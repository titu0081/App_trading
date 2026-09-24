from abc import ABC, abstractmethod


class UnitOfWorkPort(ABC):
    """Coordinates atomic commits/rollbacks across repositories within one transaction."""

    async def __aenter__(self) -> "UnitOfWorkPort":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        if exc_type:
            await self.rollback()
        else:
            await self.commit()

    @abstractmethod
    async def commit(self) -> None: ...

    @abstractmethod
    async def rollback(self) -> None: ...
