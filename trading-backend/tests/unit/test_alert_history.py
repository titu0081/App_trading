from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from src.core.use_cases.alerts.get_alert_history import GetAlertHistoryUseCase


@pytest.mark.asyncio
async def test_get_alert_history_forwards_user_and_filters():
    repository = AsyncMock()
    repository.get_history.return_value = []
    date_from = datetime(2026, 9, 1, tzinfo=timezone.utc)
    date_to = datetime(2026, 9, 16, tzinfo=timezone.utc)

    result = await GetAlertHistoryUseCase(repository).execute(
        "user-1", asset_id="asset-1", date_from=date_from, date_to=date_to
    )

    assert result == []
    repository.get_history.assert_awaited_once_with(
        "user-1",
        asset_id="asset-1",
        is_active=None,
        date_from=date_from,
        date_to=date_to,
    )
