"""Entry point shim so `uvicorn main:app` keeps working from trading-backend/.
The real application lives in src/main.py (hexagonal architecture)."""

from src.main import app

__all__ = ["app"]