from src.core.entities.alert import Alert
from src.core.exceptions import NotFoundError, UnauthorizedError
from src.core.ports.alert_repository import AlertRepositoryPort


class UpdateAlertUseCase:
    def __init__(self, alert_repo: AlertRepositoryPort):
        self.repo = alert_repo

    async def execute(
        self,
        user_id: str,
        alert_id: str,
        condition: str | None = None,
        target_value: float | None = None,
        is_active: bool | None = None,
    ) -> Alert:
        alert = await self.repo.get_by_id(alert_id)
        if alert is None:
            raise NotFoundError("alert not found")
        if alert.user_id != user_id:
            raise UnauthorizedError("you do not own this alert")

        if condition is not None:
            alert.condition = condition
        if target_value is not None:
            alert.target_value = target_value
        if is_active is not None:
            alert.is_active = is_active

        alert.__post_init__()  # re-validate domain invariants after mutation
        return await self.repo.update(alert)
