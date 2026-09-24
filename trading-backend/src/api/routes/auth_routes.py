from fastapi import APIRouter, Depends

from src.api.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    """Devuelve el user_id extraído del JWT validado. Útil para probar el middleware de auth."""
    return {"user_id": user_id}
