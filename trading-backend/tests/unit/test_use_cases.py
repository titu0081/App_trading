from unittest.mock import AsyncMock

import pytest

from src.core.entities.alert import Alert
from src.core.entities.asset import Asset
from src.core.entities.watchlist import Watchlist
from src.core.exceptions import DomainError, NotFoundError, UnauthorizedError
from src.core.use_cases.alerts.create_alert import CreateAlertUseCase
from src.core.use_cases.market.evaluate_alerts import EvaluateAlertsUseCase
from src.core.use_cases.watchlists.add_asset_to_watchlist import AddAssetToWatchlistUseCase
from src.core.use_cases.watchlists.create_watchlist import CreateWatchlistUseCase


class TestCreateWatchlistUseCase:
    @pytest.mark.asyncio
    async def test_creates_watchlist_successfully(self):
        mock_repo = AsyncMock()
        mock_repo.save.return_value = Watchlist(id="w-1", user_id="u-1", name="Tech")

        result = await CreateWatchlistUseCase(mock_repo).execute(user_id="u-1", name="Tech")

        assert result.name == "Tech"
        mock_repo.save.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_raises_error_if_name_empty(self):
        use_case = CreateWatchlistUseCase(AsyncMock())
        with pytest.raises(DomainError, match="name cannot be empty"):
            await use_case.execute(user_id="u-1", name="   ")


class TestAddAssetToWatchlistUseCase:
    @pytest.mark.asyncio
    async def test_adds_asset_when_owner_matches(self):
        watchlist_repo = AsyncMock()
        watchlist_repo.get_by_id.return_value = Watchlist(id="w-1", user_id="u-1", name="Tech")
        asset_repo = AsyncMock()
        asset_repo.find_by_id.return_value = Asset(
            id="a-1", symbol="AAPL", name="Apple", type="stock", source_api="finnhub"
        )

        use_case = AddAssetToWatchlistUseCase(watchlist_repo, asset_repo)
        await use_case.execute(user_id="u-1", watchlist_id="w-1", asset_id="a-1")

        watchlist_repo.add_asset.assert_awaited_once_with("w-1", "a-1")

    @pytest.mark.asyncio
    async def test_raises_unauthorized_when_user_is_not_owner(self):
        watchlist_repo = AsyncMock()
        watchlist_repo.get_by_id.return_value = Watchlist(id="w-1", user_id="owner", name="Tech")
        asset_repo = AsyncMock()

        use_case = AddAssetToWatchlistUseCase(watchlist_repo, asset_repo)
        with pytest.raises(UnauthorizedError):
            await use_case.execute(user_id="intruder", watchlist_id="w-1", asset_id="a-1")

    @pytest.mark.asyncio
    async def test_raises_not_found_when_watchlist_missing(self):
        watchlist_repo = AsyncMock()
        watchlist_repo.get_by_id.return_value = None
        asset_repo = AsyncMock()

        use_case = AddAssetToWatchlistUseCase(watchlist_repo, asset_repo)
        with pytest.raises(NotFoundError):
            await use_case.execute(user_id="u-1", watchlist_id="missing", asset_id="a-1")


class TestCreateAlertUseCase:
    @pytest.mark.asyncio
    async def test_creates_alert_successfully(self):
        alert_repo = AsyncMock()
        alert_repo.save.return_value = Alert(
            id="al-1",
            user_id="u-1",
            asset_id="a-1",
            type="price_target",
            condition="above",
            target_value=100.0,
            is_active=True,
        )
        asset_repo = AsyncMock()
        asset_repo.find_by_id.return_value = Asset(
            id="a-1", symbol="AAPL", name="Apple", type="stock", source_api="finnhub"
        )

        use_case = CreateAlertUseCase(alert_repo, asset_repo)
        result = await use_case.execute("u-1", "a-1", "price_target", "above", 100.0)

        assert result.id == "al-1"
        alert_repo.save.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_raises_not_found_when_asset_missing(self):
        alert_repo = AsyncMock()
        asset_repo = AsyncMock()
        asset_repo.find_by_id.return_value = None

        use_case = CreateAlertUseCase(alert_repo, asset_repo)
        with pytest.raises(NotFoundError):
            await use_case.execute("u-1", "missing", "price_target", "above", 100.0)


class TestEvaluateAlertsUseCase:
    @pytest.mark.asyncio
    async def test_creates_notification_when_alert_triggered(self):
        alert = Alert(
            id="al-1",
            user_id="u-1",
            asset_id="a-1",
            type="price_target",
            condition="above",
            target_value=100.0,
            is_active=True,
        )
        alert_repo = AsyncMock()
        alert_repo.list_active.return_value = [alert]
        notification_repo = AsyncMock()
        notification_repo.save.side_effect = lambda n: n

        use_case = EvaluateAlertsUseCase(alert_repo, notification_repo)
        result = await use_case.execute(current_prices={"a-1": 150.0})

        assert len(result) == 1
        notification_repo.save.assert_awaited_once()
        alert_repo.record_trigger.assert_awaited_once_with(
            "al-1",
            "u-1",
            150.0,
            "Alert triggered for asset a-1: price 150.0 above 100.0",
        )

    @pytest.mark.asyncio
    async def test_no_notification_when_price_missing(self):
        alert = Alert(
            id="al-1",
            user_id="u-1",
            asset_id="a-1",
            type="price_target",
            condition="above",
            target_value=100.0,
            is_active=True,
        )
        alert_repo = AsyncMock()
        alert_repo.list_active.return_value = [alert]
        notification_repo = AsyncMock()

        use_case = EvaluateAlertsUseCase(alert_repo, notification_repo)
        result = await use_case.execute(current_prices={})

        assert result == []
        notification_repo.save.assert_not_awaited()
