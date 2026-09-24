from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.entities.notification import Notification
from src.core.exceptions import NotFoundError, UnauthorizedError
from src.core.ports.notification_repository import NotificationRepositoryPort
from src.infrastructure.database.models import UserNotificationModel


def _to_entity(model: UserNotificationModel) -> Notification:
    return Notification(
        id=str(model.id),
        user_id=str(model.user_id),
        alert_id=str(model.alert_id) if model.alert_id else None,
        message=model.message,
        is_read=model.is_read,
        created_at=model.created_at,
    )


class SqlAlchemyNotificationRepository(NotificationRepositoryPort):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save(self, notification: Notification) -> Notification:
        model = UserNotificationModel(
            user_id=notification.user_id,
            alert_id=notification.alert_id,
            message=notification.message,
            is_read=notification.is_read,
        )
        self.session.add(model)
        await self.session.flush()
        return _to_entity(model)

    async def get_by_user(self, user_id: str, unread_only: bool = False) -> list[Notification]:
        query = select(UserNotificationModel).where(UserNotificationModel.user_id == user_id)
        if unread_only:
            query = query.where(UserNotificationModel.is_read.is_(False))
        result = await self.session.execute(query.order_by(UserNotificationModel.created_at.desc()))
        return [_to_entity(m) for m in result.scalars().all()]

    async def mark_as_read(self, notification_id: str, user_id: str) -> Notification:
        model = await self.session.get(UserNotificationModel, notification_id)
        if model is None:
            raise NotFoundError("notification not found")
        if str(model.user_id) != user_id:
            raise UnauthorizedError("you do not own this notification")
        model.is_read = True
        await self.session.flush()
        return _to_entity(model)
