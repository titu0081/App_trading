from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_db
from src.infrastructure.database.models import AssetDividendModel

router = APIRouter(prefix="/dividends", tags=["dividends"])


class CreateDividendRequest(BaseModel):
    asset_id: str
    amount: float = Field(ge=0)
    yield_value: float | None = Field(default=None, ge=0)
    pay_date: date
    ex_dividend_date: date


class DividendResponse(BaseModel):
    id: str
    asset_id: str
    amount: float
    yield_value: float | None
    pay_date: date
    ex_dividend_date: date


def _to_response(model: AssetDividendModel) -> DividendResponse:
    return DividendResponse(
        id=str(model.id),
        asset_id=str(model.asset_id),
        amount=float(model.amount),
        yield_value=float(model.yield_) if model.yield_ is not None else None,
        pay_date=model.pay_date,
        ex_dividend_date=model.ex_dividend_date,
    )


@router.get("/{asset_id}", response_model=list[DividendResponse])
async def list_dividends(
    asset_id: str,
    user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(AssetDividendModel).where(AssetDividendModel.asset_id == asset_id)
    )
    return [_to_response(d) for d in result.scalars().all()]


@router.post("", response_model=DividendResponse, status_code=status.HTTP_201_CREATED)
async def create_dividend(
    payload: CreateDividendRequest,
    user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    model = AssetDividendModel(
        asset_id=payload.asset_id,
        amount=payload.amount,
        yield_=payload.yield_value,
        pay_date=payload.pay_date,
        ex_dividend_date=payload.ex_dividend_date,
    )
    session.add(model)
    await session.flush()
    return _to_response(model)
