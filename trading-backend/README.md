# InFinance Backend

API para InFinance, construida con **FastAPI + SQLAlchemy 2.0 (async) + Supabase (PostgreSQL)**,
siguiendo **Arquitectura Hexagonal** (Ports & Adapters).

## Arquitectura

```
src/
├── main.py                # Punto de entrada FastAPI
├── api/                   # Adaptadores de entrada: rutas HTTP, WebSocket, dependencias
├── core/                  # Dominio puro (sin dependencias de frameworks)
│   ├── entities/          # Asset, Watchlist, Alert, Dividend, Notification
│   ├── ports/              # Interfaces (repositorios, market data provider, UoW)
│   └── use_cases/          # Lógica de aplicación (watchlists, alerts, market)
└── infrastructure/         # Adaptadores de salida: DB, APIs externas, Celery, config
```

- **Auth**: delegada a Supabase Auth. FastAPI valida el JWT localmente con `SUPABASE_JWT_SECRET`
  (ver `src/api/dependencies.py::get_current_user`).
- **DB**: SQLAlchemy async se conecta directamente a PostgreSQL con la `service_role key`
  (bypass de RLS). La autorización se implementa explícitamente en los use cases.
- **Tiempo real**: WebSocket (`/ws/prices`) solo emite precios; las alertas se evalúan cada
  60s vía Celery Beat (`evaluate_alerts_task`).
- **APIs externas**: Finnhub (stocks/forex/index) y CoinGecko (crypto), unificadas bajo el
  puerto `MarketDataProviderPort`.

## Setup

```powershell
# 1. Entorno virtual
python -m venv venv
venv\Scripts\Activate.ps1

# 2. Dependencias
pip install -r requirements.txt

# 3. Variables de entorno
copy .env.exampl .env
# Editar .env con tus credenciales de Supabase y APIs externas

# 4. Levantar la API
uvicorn src.main:app --reload
```

La documentación interactiva queda disponible en `http://localhost:8000/docs`.

## Docker

```powershell
docker compose -f docker/docker-compose.yml up --build
```

Levanta la API, PostgreSQL local, Redis, el worker de Celery y Celery Beat.

## Testing

```powershell
pytest
pytest --cov=src --cov-report=term-missing
```

- `tests/unit/`: entidades y use cases con mocks (sin DB).
- `tests/integration/`: endpoints HTTP con `httpx.AsyncClient` (middleware de auth, etc.).

## Celery (motor de alertas)

```powershell
celery -A src.infrastructure.celery.config.celery_app worker --loglevel=info
celery -A src.infrastructure.celery.config.celery_app beat --loglevel=info
```

## Modelo de datos

El esquema SQL completo (tablas, ENUMs, índices, RLS) vive en
[docs/Plan_Arquitectura_Backend_InFinance_DEFINITIVO_FINAL.md](../docs/Plan_Arquitectura_Backend_InFinance_DEFINITIVO_FINAL.md)
y el diccionario de datos en
[docs/DICCIONARIO_BASE_DATOS_INFInance_COMPLETO.txt](../docs/DICCIONARIO_BASE_DATOS_INFInance_COMPLETO.txt).
