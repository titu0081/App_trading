from src.core.exceptions import NotFoundError, UnauthorizedError
from src.core.ports.alert_repository import AlertRepositoryPort


class DeleteAlertUseCase:
    def __init__(self, alert_repo: AlertRepositoryPort):
        self.repo = alert_repo

    async def execute(self, user_id: str, alert_id: str) -> None:
        alert = await self.repo.get_by_id(alert_id)
        if alert is None:
            raise NotFoundError("alert not found")
        if alert.user_id != user_id:
            raise UnauthorizedError("you do not own this alert")
        await self.repo.delete(alert_id)
