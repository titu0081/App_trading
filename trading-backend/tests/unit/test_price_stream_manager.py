from unittest.mock import AsyncMock

import pytest

from src.api.websocket.price_stream import PriceStreamManager


class TestPriceStreamManager:
    @pytest.mark.asyncio
    async def test_connect_broadcast_and_disconnect(self):
        manager = PriceStreamManager()
        websocket = AsyncMock()

        await manager.connect(websocket, "AAPL")
        websocket.accept.assert_awaited_once()

        await manager.broadcast("AAPL", 123.45)
        websocket.send_json.assert_awaited_once_with(
            {"symbol": "AAPL", "price": 123.45}
        )

        manager.disconnect(websocket, "AAPL")
        await manager.broadcast("AAPL", 1.0)
        assert websocket.send_json.await_count == 1

    @pytest.mark.asyncio
    async def test_broadcast_only_reaches_subscribed_symbol(self):
        manager = PriceStreamManager()
        apple_socket = AsyncMock()
        bitcoin_socket = AsyncMock()
        await manager.connect(apple_socket, "AAPL")
        await manager.connect(bitcoin_socket, "BTC")

        await manager.broadcast("AAPL", 200.0)

        apple_socket.send_json.assert_awaited_once()
        bitcoin_socket.send_json.assert_not_awaited()
