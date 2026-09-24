from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.entities.alert import Alert
from src.core.entities.alert_history import AlertHistoryEntry
from src.core.ports.alert_repository import AlertRepositoryPort
from src.infrastructure.database.models import AlertHistoryModel, UserAlertModel


def _to_entity(model: UserAlertModel) -> Alert:
    return Alert(
        id=str(model.id),
        user_id=str(model.user_id),
        asset_id=str(model.asset_id),
        type=model.type.value,
        condition=model.condition.value if model.condition else None,
        target_value=float(model.target_value) if model.target_value is not None else None,
        is_active=model.is_active,
        created_at=model.created_at,
    )


def _to_history_entry(history: AlertHistoryModel, alert: UserAlertModel | None) -> AlertHistoryEntry:
    return AlertHistoryEntry(
        id=str(history.id),
        alert_id=str(history.alert_id) if history.alert_id else None,
        asset_id=str(alert.asset_id) if alert else None,
        condition=alert.condition.value if alert and alert.condition else None,
        is_active=alert.is_active if alert else None,
        triggered_price=float(history.triggered_price) if history.triggered_price is not None else None,
        message=history.message,
        created_at=history.created_at,
    )


class SqlAlchemyAlertRepository(AlertRepositoryPort):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save(self, alert: Alert) -> Alert:
        model = UserAlertModel(
            user_id=alert.user_id,
            asset_id=alert.asset_id,
            type=alert.type,
            condition=alert.condition,
            target_value=alert.target_value,
            is_active=alert.is_active,
        )
        self.session.add(model)
        await self.session.flush()
        return _to_entity(model)

    async def get_by_id(self, alert_id: str) -> Alert | None:
        model = await self.session.get(UserAlertModel, alert_id)
        return _to_entity(model) if model else None

    async def get_by_user(self, user_id: str) -> list[Alert]:
        result = await self.session.execute(select(UserAlertModel).where(UserAlertModel.user_id == user_id))
        return [_to_entity(m) for m in result.scalars().all()]

    async def get_active_by_user(self, user_id: str) -> list[Alert]:
        result = await self.session.execute(
            select(UserAlertModel).where(
                UserAlertModel.user_id == user_id, UserAlertModel.is_active.is_(True)
            )
        )
        return [_to_entity(m) for m in result.scalars().all()]

    async def list_active(self) -> list[Alert]:
        result = await self.session.execute(select(UserAlertModel).where(UserAlertModel.is_active.is_(True)))
        return [_to_entity(m) for m in result.scalars().all()]

    async def update(self, alert: Alert) -> Alert:
        model = await self.session.get(UserAlertModel, alert.id)
        if model is None:
            raise ValueError("alert not found")
        model.condition = alert.condition
        model.target_value = alert.target_value
        model.is_active = alert.is_active
        await self.session.flush()
        return _to_entity(model)

    async def delete(self, alert_id: str) -> None:
        model = await self.session.get(UserAlertModel, alert_id)
        if model:
            await self.session.delete(model)
            await self.session.flush()

    async def record_trigger(
        self, alert_id: str, user_id: str, triggered_price: float, message: str
    ) -> None:
        history = AlertHistoryModel(
            alert_id=alert_id,
            user_id=user_id,
            triggered_price=triggered_price,
            message=message,
        )
        self.session.add(history)
        await self.session.flush()

    async def get_history(
        self,
        user_id: str,
        asset_id: str | None = None,
        is_active: bool | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[AlertHistoryEntry]:
        query = (
            select(AlertHistoryModel, UserAlertModel)
            .outerjoin(UserAlertModel, AlertHistoryModel.alert_id == UserAlertModel.id)
            .where(AlertHistoryModel.user_id == user_id)
        )
        if asset_id:
            query = query.where(UserAlertModel.asset_id == asset_id)
        if is_active is not None:
            query = query.where(UserAlertModel.is_active.is_(is_active))
        if date_from:
            query = query.where(AlertHistoryModel.created_at >= date_from)
        if date_to:
            query = query.where(AlertHistoryModel.created_at <= date_to)
        result = await self.session.execute(query.order_by(AlertHistoryModel.created_at.desc()))
        return [_to_history_entry(history, alert) for history, alert in result.all()]
