from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.api.dependencies import get_asset_repository, get_current_user, get_watchlist_repository
from src.core.exceptions import DomainError, NotFoundError, UnauthorizedError
from src.core.use_cases.watchlists.add_asset_to_watchlist import AddAssetToWatchlistUseCase
from src.core.use_cases.watchlists.create_watchlist import CreateWatchlistUseCase
from src.core.use_cases.watchlists.delete_watchlist import DeleteWatchlistUseCase
from src.core.use_cases.watchlists.list_user_watchlists import ListUserWatchlistsUseCase
from src.core.use_cases.watchlists.remove_asset_from_watchlist import RemoveAssetFromWatchlistUseCase
from src.infrastructure.database.repositories.sqlalchemy_asset_repo import SqlAlchemyAssetRepository
from src.infrastructure.database.repositories.sqlalchemy_watchlist_repo import (
    SqlAlchemyWatchlistRepository,
)

router = APIRouter(prefix="/watchlists", tags=["watchlists"])


class CreateWatchlistRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class AddAssetRequest(BaseModel):
    asset_id: str


class WatchlistResponse(BaseModel):
    id: str
    user_id: str
    name: str
    asset_ids: list[str]


def _to_response(watchlist) -> WatchlistResponse:
    return WatchlistResponse(
        id=watchlist.id,
        user_id=watchlist.user_id,
        name=watchlist.name,
        asset_ids=watchlist.asset_ids,
    )


@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def create_watchlist(
    payload: CreateWatchlistRequest,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyWatchlistRepository = Depends(get_watchlist_repository),
):
    try:
        watchlist = await CreateWatchlistUseCase(repo).execute(user_id, payload.name)
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _to_response(watchlist)


@router.get("", response_model=list[WatchlistResponse])
async def list_watchlists(
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyWatchlistRepository = Depends(get_watchlist_repository),
):
    watchlists = await ListUserWatchlistsUseCase(repo).execute(user_id)
    return [_to_response(w) for w in watchlists]


@router.delete("/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watchlist(
    watchlist_id: str,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyWatchlistRepository = Depends(get_watchlist_repository),
):
    try:
        await DeleteWatchlistUseCase(repo).execute(user_id, watchlist_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except UnauthorizedError as exc:
        raise HTTPException(status_code=403, detail=str(exc))


@router.post("/{watchlist_id}/assets", status_code=status.HTTP_204_NO_CONTENT)
async def add_asset(
    watchlist_id: str,
    payload: AddAssetRequest,
    user_id: str = Depends(get_current_user),
    watchlist_repo: SqlAlchemyWatchlistRepository = Depends(get_watchlist_repository),
    asset_repo: SqlAlchemyAssetRepository = Depends(get_asset_repository),
):
    try:
        await AddAssetToWatchlistUseCase(watchlist_repo, asset_repo).execute(
            user_id, watchlist_id, payload.asset_id
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except UnauthorizedError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{watchlist_id}/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_asset(
    watchlist_id: str,
    asset_id: str,
    user_id: str = Depends(get_current_user),
    repo: SqlAlchemyWatchlistRepository = Depends(get_watchlist_repository),
):
    try:
        await RemoveAssetFromWatchlistUseCase(repo).execute(user_id, watchlist_id, asset_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except UnauthorizedError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except DomainError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
