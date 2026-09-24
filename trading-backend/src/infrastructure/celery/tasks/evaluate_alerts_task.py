import asyncio

from src.core.use_cases.market.evaluate_alerts import EvaluateAlertsUseCase
from src.infrastructure.celery.config import celery_app
from src.infrastructure.database.connection import async_session_factory
from src.infrastructure.database.repositories.sqlalchemy_alert_repo import SqlAlchemyAlertRepository
from src.infrastructure.database.repositories.sqlalchemy_asset_repo import SqlAlchemyAssetRepository
from src.infrastructure.database.repositories.sqlalchemy_notification_repo import (
    SqlAlchemyNotificationRepository,
)
from src.infrastructure.external.coingecko_client import CoinGeckoClient
from src.infrastructure.external.finnhub_client import FinnhubClient
from src.shared.logger import logger

_PROVIDERS = {"finnhub": FinnhubClient(), "coingecko": CoinGeckoClient()}


async def _run() -> int:
    async with async_session_factory() as session:
        alert_repo = SqlAlchemyAlertRepository(session)
        notification_repo = SqlAlchemyNotificationRepository(session)
        asset_repo = SqlAlchemyAssetRepository(session)

        active_alerts = await alert_repo.list_active()
        current_prices: dict[str, float] = {}
        for alert in active_alerts:
            if alert.asset_id in current_prices:
                continue
            asset = await asset_repo.find_by_id(alert.asset_id)
            if asset is None:
                continue
            provider = _PROVIDERS.get(asset.source_api)
            if provider is None:
                continue
            try:
                current_prices[alert.asset_id] = await provider.get_price(asset.symbol)
            except Exception as exc:  # external API failures should not crash the beat cycle
                logger.warning(f"Failed to fetch price for {asset.symbol}: {exc}")

        use_case = EvaluateAlertsUseCase(alert_repo, notification_repo)
        triggered = await use_case.execute(current_prices)

        for alert in active_alerts:
            price = current_prices.get(alert.asset_id)
            if price is not None and alert.is_triggered(price):
                await alert_repo.record_trigger(
                    alert_id=alert.id,
                    user_id=alert.user_id,
                    triggered_price=price,
                    message=f"Alert {alert.id} triggered at price {price}",
                )

        await session.commit()
        return len(triggered)


@celery_app.task(name="src.infrastructure.celery.tasks.evaluate_alerts_task.evaluate_alerts_task")
def evaluate_alerts_task() -> int:
    """Periodic task (every 60s) that evaluates all active alerts against current prices."""
    return asyncio.run(_run())
