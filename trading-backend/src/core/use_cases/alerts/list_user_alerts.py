from src.core.entities.alert import Alert
from src.core.ports.alert_repository import AlertRepositoryPort


class ListUserAlertsUseCase:
    def __init__(self, alert_repo: AlertRepositoryPort):
        self.repo = alert_repo

    async def execute(self, user_id: str) -> list[Alert]:
        return await self.repo.get_by_user(user_id)
