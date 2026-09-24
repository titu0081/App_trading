from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from src.api import dependencies
from src.core.entities.alert_history import AlertHistoryEntry
from src.main import app


class TestAlertHistoryRoute:
    @pytest.mark.asyncio
    async def test_requires_auth(self, client):
        response = await client.get("/alerts/history")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_returns_history_and_forwards_filters(
        self, client, auth_headers, user_id
    ):
        entry = AlertHistoryEntry(
            id="history-1",
            alert_id="alert-1",
            asset_id="asset-1",
            condition="above",
            is_active=True,
            triggered_price=150.0,
            message="Alert triggered",
            created_at=datetime(2026, 9, 16, 10, 0, tzinfo=timezone.utc),
        )
        repo = AsyncMock()
        repo.get_history.return_value = [entry]
        app.dependency_overrides[dependencies.get_alert_repository] = lambda: repo
        try:
            response = await client.get(
                "/alerts/history",
                params={
                    "asset_id": "asset-1",
                    "is_active": "true",
                    "date_from": "2026-09-01T00:00:00+00:00",
                    "date_to": "2026-09-16T23:59:59+00:00",
                },
                headers=auth_headers,
            )
        finally:
            app.dependency_overrides.pop(dependencies.get_alert_repository, None)

        assert response.status_code == 200
        body = response.json()
        assert body[0]["id"] == "history-1"
        assert body[0]["asset_id"] == "asset-1"
        assert body[0]["triggered_price"] == 150.0
        assert body[0]["created_at"].startswith("2026-09-16T10:00:00")
        repo.get_history.assert_awaited_once_with(
            user_id,
            asset_id="asset-1",
            is_active=True,
            date_from=datetime(2026, 9, 1, tzinfo=timezone.utc),
            date_to=datetime(2026, 9, 16, 23, 59, 59, tzinfo=timezone.utc),
        )
