from datetime import datetime

from src.core.entities.alert_history import AlertHistoryEntry
from src.core.ports.alert_repository import AlertRepositoryPort


class GetAlertHistoryUseCase:
    def __init__(self, repository: AlertRepositoryPort):
        self.repository = repository

    async def execute(
        self,
        user_id: str,
        asset_id: str | None = None,
        is_active: bool | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[AlertHistoryEntry]:
        return await self.repository.get_history(
            user_id,
            asset_id=asset_id,
            is_active=is_active,
            date_from=date_from,
            date_to=date_to,
        )
