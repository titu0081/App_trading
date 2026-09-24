from src.core.entities.notification import Notification
from src.core.ports.alert_repository import AlertRepositoryPort
from src.core.ports.notification_repository import NotificationRepositoryPort


class EvaluateAlertsUseCase:
    """Pure application logic: checks active alerts against current prices and
    creates notifications when triggered. Prices are supplied by the caller
    (the Celery task) so this use case stays free of I/O side effects."""

    def __init__(
        self,
        alert_repo: AlertRepositoryPort,
        notification_repo: NotificationRepositoryPort,
    ):
        self.alert_repo = alert_repo
        self.notification_repo = notification_repo

    async def execute(self, current_prices: dict[str, float]) -> list[Notification]:
        triggered_notifications = []
        active_alerts = await self.alert_repo.list_active()

        for alert in active_alerts:
            current_price = current_prices.get(alert.asset_id)
            if current_price is None:
                continue
            if alert.is_triggered(current_price):
                message = (
                    f"Alert triggered for asset {alert.asset_id}: "
                    f"price {current_price} {alert.condition} {alert.target_value}"
                )
                notification = Notification(
                    id=None,
                    user_id=alert.user_id,
                    alert_id=alert.id,
                    message=message,
                )
                saved = await self.notification_repo.save(notification)
                await self.alert_repo.record_trigger(
                    alert.id, alert.user_id, current_price, message
                )
                triggered_notifications.append(saved)

        return triggered_notifications
