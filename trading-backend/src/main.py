from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import (
    alert_routes,
    auth_routes,
    dividend_routes,
    market_routes,
    notification_routes,
    watchlist_routes,
)
from src.api.websocket import price_stream
from src.infrastructure.config import settings
from src.infrastructure.database.connection import (
    engine,
    test_connection,
)
from src.shared.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    # Verifica que PostgreSQL/Supabase esté realmente accesible
    await test_connection()
    yield
    # Cierra el pool de conexiones de SQLAlchemy
    await engine.dispose()
    logger.info("Shutting down InFinance API")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

# JWT va en el header Authorization, no en cookies, por eso allow_credentials=False.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(watchlist_routes.router)
app.include_router(alert_routes.router)
app.include_router(market_routes.router)
app.include_router(dividend_routes.router)
app.include_router(notification_routes.router)
app.include_router(price_stream.router)


@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de InFinance", "version": settings.app_version}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
