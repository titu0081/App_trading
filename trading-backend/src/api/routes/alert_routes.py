from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.api.dependencies import get_alert_repository, get_asset_repository, get_current_user
from src.core.exceptions import DomainError, NotFoundError, UnauthorizedError
from src.core.use_cases.alerts.create_alert import CreateAlertUseCase
from src.core.use_cases.alerts.delete_alert import DeleteAlertUseCase
from src.core.use_cases.alerts.get_alert_history import GetAlertHistoryUseCase
from src.core.use_cases.alerts.list_user_alerts import ListUserAlertsUseCase
from src.core.use_cases.alerts.update_alert import UpdateAlertUseCase
from src.infrastructure.database.repositories.sqlalchemy_alert_repo import SqlAlchemyAlertRepository
from src.infrastructure.database.repositories.sqlalchemy_asset_repo import SqlAlchemyAssetRepository

router = APIRouter(prefix="/alerts", tags=["alerts"])


class CreateAlertRequest(BaseModel):
    asset_id: str
    type: str
    condition: str | None = None
    target_value: float | None = Field(default=None, ge=0)


class UpdateAlertRequest(BaseModel):
    condition: str | None = None
    target_value: float | None = None
    is_active: bool | None = None


class AlertResponse(BaseModel):
    id: str
    user_id: str
    asset_id: str
    type: str
    condition: str | None
    target_value: float | None
    is_active: bool


class AlertHistoryResponse(BaseModel):
    id: str
    alert_id: str | None
    asset_id: str | None
    condition: str | None
    is_active: bool | None
    triggered_price: float | None
    message: str
    created_at: datetime


def _to_response(alert) -> AlertResponse:
    return AlertResponse(
        id=alert.id,
        user_id=alert.user_id,
        asset_id=alert.asset_id,
        type=alert.type,
        condition=alert.condition,
        target_value=alert.target_value,
        is_active=alert.is_active,
    )


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    payload: CreateAlertRequest,
    user_id: str = Depends(get_current_user),
    alert_repo: SqlAlchemyAlertRepository = Depends(get_alert_repository),
    asset_repo: SqlAlchemyAssetRepository = Depends(get_asset_repository),
):
    try:
        alert = await CreateAlertUseCase(alert_repo, asset_repo).execute(
            user_id, payload.asset_id, payload.type, payload.condition, payload.target_value
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _to_response(alert)


@router.get("", response_model=list[AlertResponse])
async def list_alerts(
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyAlertRepository = Depends(get_alert_repository),
):
    alerts = await ListUserAlertsUseCase(repo).execute(user_id)
    return [_to_response(a) for a in alerts]


@router.get("/history", response_model=list[AlertHistoryResponse])
async def list_alert_history(
    asset_id: str | None = None,
    is_active: bool | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyAlertRepository = Depends(get_alert_repository),
):
    history = await GetAlertHistoryUseCase(repo).execute(
        user_id,
        asset_id=asset_id,
        is_active=is_active,
        date_from=date_from,
        date_to=date_to,
    )
    return [AlertHistoryResponse(**entry.__dict__) for entry in history]


@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    payload: UpdateAlertRequest,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyAlertRepository = Depends(get_alert_repository),
):
    try:
        alert = await UpdateAlertUseCase(repo).execute(
            user_id, alert_id, payload.condition, payload.target_value, payload.is_active
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except UnauthorizedError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _to_response(alert)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyAlertRepository = Depends(get_alert_repository),
):
    try:
        await DeleteAlertUseCase(repo).execute(user_id, alert_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except UnauthorizedError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
