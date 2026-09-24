from src.core.entities.alert import Alert
from src.core.exceptions import NotFoundError
from src.core.ports.alert_repository import AlertRepositoryPort
from src.core.ports.asset_repository import AssetRepositoryPort


class CreateAlertUseCase:
    def __init__(self, alert_repo: AlertRepositoryPort, asset_repo: AssetRepositoryPort):
        self.alert_repo = alert_repo
        self.asset_repo = asset_repo

    async def execute(
        self,
        user_id: str,
        asset_id: str,
        type: str,
        condition: str | None,
        target_value: float | None,
    ) -> Alert:
        asset = await self.asset_repo.find_by_id(asset_id)
        if asset is None:
            raise NotFoundError("asset not found")

        alert = Alert(
            id=None,
            user_id=user_id,
            asset_id=asset_id,
            type=type,
            condition=condition,
            target_value=target_value,
            is_active=True,
        )
        return await self.alert_repo.save(alert)
