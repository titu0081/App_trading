from fastapi import APIRouter, Depends, HTTPException

from src.api.dependencies import get_asset_repository, get_current_user, get_market_providers
from src.core.exceptions import DomainError, ExternalServiceError, NotFoundError
from src.core.use_cases.market.fetch_historical_prices import FetchHistoricalPricesUseCase
from src.core.use_cases.market.fetch_asset_price import FetchAssetPriceUseCase
from src.infrastructure.database.repositories.sqlalchemy_asset_repo import SqlAlchemyAssetRepository

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/assets")
async def list_assets(
    asset_type: str | None = None,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyAssetRepository = Depends(get_asset_repository),
):
    assets = await repo.list_all(asset_type)
    return [
        {"id": a.id, "symbol": a.symbol, "name": a.name, "type": a.type, "source_api": a.source_api}
        for a in assets
    ]


@router.get("/price/{symbol}")
async def get_price(
    symbol: str,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyAssetRepository = Depends(get_asset_repository),
    providers: dict = Depends(get_market_providers),
):
    try:
        price = await FetchAssetPriceUseCase(repo, providers).execute(symbol)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ExternalServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {"symbol": symbol.upper(), "price": price}


@router.get("/history/{symbol}")
async def get_historical_prices(
    symbol: str,
    interval: str = "1D",
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyAssetRepository = Depends(get_asset_repository),
    providers: dict = Depends(get_market_providers),
):
    try:
        return await FetchHistoricalPricesUseCase(repo, providers).execute(symbol, interval)
    except ExternalServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except DomainError as exc:
        status_code = 400 if not isinstance(exc, NotFoundError) else 404
        raise HTTPException(status_code=status_code, detail=str(exc))
