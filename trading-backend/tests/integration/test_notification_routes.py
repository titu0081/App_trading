from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from src.api import dependencies
from src.core.entities.notification import Notification
from src.main import app


def build_notification(user_id: str, is_read: bool = False) -> Notification:
    return Notification(
        id="notification-1",
        user_id=user_id,
        alert_id="alert-1",
        message="Alert triggered for asset",
        is_read=is_read,
        created_at=datetime(2026, 9, 16, 10, 0, tzinfo=timezone.utc),
    )


class TestNotificationRoutes:
    @pytest.mark.asyncio
    async def test_list_requires_auth(self, client):
        response = await client.get("/notifications")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_list_returns_notifications_with_created_at(
        self, client, auth_headers, user_id
    ):
        repo = AsyncMock()
        repo.get_by_user.return_value = [build_notification(user_id)]
        app.dependency_overrides[dependencies.get_notification_repository] = (
            lambda: repo
        )
        try:
            response = await client.get(
                "/notifications", params={"unread_only": "true"}, headers=auth_headers
            )
        finally:
            app.dependency_overrides.pop(
                dependencies.get_notification_repository, None
            )

        assert response.status_code == 200
        body = response.json()
        assert body[0]["id"] == "notification-1"
        assert body[0]["is_read"] is False
        assert body[0]["created_at"].startswith("2026-09-16T10:00:00")
        repo.get_by_user.assert_awaited_once_with(user_id, True)

    @pytest.mark.asyncio
    async def test_mark_as_read_requires_auth(self, client):
        response = await client.patch("/notifications/notification-1/read", json={})
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_mark_as_read_returns_updated_notification(
        self, client, auth_headers, user_id
    ):
        repo = AsyncMock()
        repo.mark_as_read.return_value = build_notification(user_id, is_read=True)
        app.dependency_overrides[dependencies.get_notification_repository] = (
            lambda: repo
        )
        try:
            response = await client.patch(
                "/notifications/notification-1/read", json={}, headers=auth_headers
            )
        finally:
            app.dependency_overrides.pop(
                dependencies.get_notification_repository, None
            )

        assert response.status_code == 200
        assert response.json()["is_read"] is True
        repo.mark_as_read.assert_awaited_once_with("notification-1", user_id)
