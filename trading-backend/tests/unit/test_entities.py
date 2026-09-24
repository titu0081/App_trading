import pytest

from src.core.entities.alert import Alert
from src.core.entities.asset import Asset
from src.core.entities.watchlist import Watchlist
from src.core.exceptions import DomainError


class TestAlertEntity:
    def _make_alert(self, **overrides):
        defaults = dict(
            id=None,
            user_id="uuid-1",
            asset_id="uuid-btc",
            type="price_target",
            condition="above",
            target_value=50000.0,
            is_active=True,
        )
        defaults.update(overrides)
        return Alert(**defaults)

    def test_is_triggered_above_when_price_exceeds_target(self):
        alert = self._make_alert()
        assert alert.is_triggered(current_price=51000.0) is True

    def test_is_triggered_above_when_price_below_target(self):
        alert = self._make_alert()
        assert alert.is_triggered(current_price=49000.0) is False

    def test_is_triggered_below(self):
        alert = self._make_alert(condition="below", target_value=100.0)
        assert alert.is_triggered(current_price=90.0) is True
        assert alert.is_triggered(current_price=110.0) is False

    def test_crosses_up_requires_previous_price(self):
        alert = self._make_alert(condition="crosses_up", target_value=100.0)
        assert alert.is_triggered(current_price=101.0, previous_price=99.0) is True
        assert alert.is_triggered(current_price=101.0, previous_price=None) is False

    def test_inactive_alert_never_triggers(self):
        alert = self._make_alert(is_active=False)
        assert alert.is_triggered(current_price=999999.0) is False

    def test_negative_target_raises_domain_error(self):
        with pytest.raises(DomainError, match="target_value must be non-negative"):
            self._make_alert(target_value=-100.0)

    def test_invalid_condition_raises_domain_error(self):
        with pytest.raises(DomainError, match="invalid alert condition"):
            self._make_alert(condition="sideways")


class TestWatchlistEntity:
    def test_empty_name_raises_domain_error(self):
        with pytest.raises(DomainError, match="name cannot be empty"):
            Watchlist(id=None, user_id="u-1", name="   ")

    def test_add_and_remove_asset(self):
        watchlist = Watchlist(id=None, user_id="u-1", name="Tech")
        watchlist.add_asset("asset-1")
        assert watchlist.has_asset("asset-1") is True
        watchlist.remove_asset("asset-1")
        assert watchlist.has_asset("asset-1") is False

    def test_duplicate_asset_raises_domain_error(self):
        watchlist = Watchlist(id=None, user_id="u-1", name="Tech")
        watchlist.add_asset("asset-1")
        with pytest.raises(DomainError, match="already in watchlist"):
            watchlist.add_asset("asset-1")


class TestAssetEntity:
    def test_symbol_is_normalized_to_uppercase(self):
        asset = Asset(id=None, symbol="aapl", name="Apple Inc.", type="stock", source_api="finnhub")
        assert asset.symbol == "AAPL"

    def test_invalid_type_raises_domain_error(self):
        with pytest.raises(DomainError, match="invalid asset type"):
            Asset(id=None, symbol="AAPL", name="Apple Inc.", type="bond", source_api="finnhub")
