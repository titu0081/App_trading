import asyncio

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from src.infrastructure.external.coingecko_client import CoinGeckoClient
from src.infrastructure.external.finnhub_client import FinnhubClient
from src.shared.logger import logger

router = APIRouter()

_PROVIDERS = {"finnhub": FinnhubClient(), "coingecko": CoinGeckoClient()}


class PriceStreamManager:
    """Mantiene las conexiones activas por símbolo. Sin lógica de negocio (solo visualización)."""

    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, symbol: str) -> None:
        await websocket.accept()
        self.active_connections.setdefault(symbol, []).append(websocket)

    def disconnect(self, websocket: WebSocket, symbol: str) -> None:
        connections = self.active_connections.get(symbol, [])
        if websocket in connections:
            connections.remove(websocket)

    async def broadcast(self, symbol: str, price: float) -> None:
        for conn in self.active_connections.get(symbol, []):
            await conn.send_json({"symbol": symbol, "price": price})


manager = PriceStreamManager()


@router.websocket("/ws/prices")
async def price_stream(
    websocket: WebSocket,
    symbol: str = Query(...),
    source: str = Query("finnhub"),
):
    await manager.connect(websocket, symbol)
    provider = _PROVIDERS.get(source)
    try:
        while True:
            if provider:
                try:
                    price = await provider.get_price(symbol)
                    await manager.broadcast(symbol, price)
                except Exception as exc:
                    logger.warning(f"price_stream: failed to fetch {symbol} from {source}: {exc}")
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket, symbol)
