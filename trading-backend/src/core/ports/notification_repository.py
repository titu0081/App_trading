from abc import ABC, abstractmethod

from src.core.entities.notification import Notification


class NotificationRepositoryPort(ABC):
    """Port for persisting and reading user notifications."""

    @abstractmethod
    async def save(self, notification: Notification) -> Notification: ...

    @abstractmethod
    async def get_by_user(self, user_id: str, unread_only: bool = False) -> list[Notification]: ...

    @abstractmethod
    async def mark_as_read(self, notification_id: str, user_id: str) -> Notification: ...
