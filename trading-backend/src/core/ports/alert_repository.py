from abc import ABC, abstractmethod
from datetime import datetime

from src.core.entities.alert import Alert
from src.core.entities.alert_history import AlertHistoryEntry


class AlertRepositoryPort(ABC):
    """Port for persisting user alerts and recording trigger history."""

    @abstractmethod
    async def save(self, alert: Alert) -> Alert: ...

    @abstractmethod
    async def get_by_id(self, alert_id: str) -> Alert | None: ...

    @abstractmethod
    async def get_by_user(self, user_id: str) -> list[Alert]: ...

    @abstractmethod
    async def get_active_by_user(self, user_id: str) -> list[Alert]: ...

    @abstractmethod
    async def list_active(self) -> list[Alert]: ...

    @abstractmethod
    async def update(self, alert: Alert) -> Alert: ...

    @abstractmethod
    async def delete(self, alert_id: str) -> None: ...

    @abstractmethod
    async def record_trigger(
        self, alert_id: str, user_id: str, triggered_price: float, message: str
    ) -> None:
        """Inserts an alert_history row when an alert fires."""
        ...

    @abstractmethod
    async def get_history(
        self,
        user_id: str,
        asset_id: str | None = None,
        is_active: bool | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[AlertHistoryEntry]: ...
