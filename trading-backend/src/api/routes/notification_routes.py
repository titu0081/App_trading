from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from src.api.dependencies import get_current_user, get_notification_repository
from src.core.exceptions import NotFoundError, UnauthorizedError
from src.infrastructure.database.repositories.sqlalchemy_notification_repo import (
    SqlAlchemyNotificationRepository,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationResponse(BaseModel):
    id: str
    alert_id: str | None
    message: str
    is_read: bool
    created_at: datetime


def _to_response(n) -> NotificationResponse:
    return NotificationResponse(
        id=n.id,
        alert_id=n.alert_id,
        message=n.message,
        is_read=n.is_read,
        created_at=n.created_at,
    )


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    unread_only: bool = False,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyNotificationRepository = Depends(get_notification_repository),
):
    notifications = await repo.get_by_user(user_id, unread_only)
    return [_to_response(n) for n in notifications]


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: str,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyNotificationRepository = Depends(get_notification_repository),
):
    try:
        notification = await repo.mark_as_read(notification_id, user_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except UnauthorizedError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    return _to_response(notification)
