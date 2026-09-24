import asyncio
import time
from collections import deque


class RateLimiter:
    """Sliding-window rate limiter: allows at most `max_calls` within `period` seconds."""

    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self._calls: deque[float] = deque()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        async with self._lock:
            now = time.monotonic()
            while self._calls and now - self._calls[0] > self.period:
                self._calls.popleft()

            if len(self._calls) >= self.max_calls:
                wait_time = self.period - (now - self._calls[0])
                if wait_time > 0:
                    await asyncio.sleep(wait_time)

            self._calls.append(time.monotonic())
