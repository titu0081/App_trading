# PLAN DE ARQUITECTURA BACKEND — INFINANCE
## Versión Definitiva | FastAPI + Supabase (PostgreSQL) + Arquitectura Hexagonal + TDD

---

## 1. STACK TECNOLÓGICO DEFINITIVO

| Capa | Tecnología | Versión recomendada | Justificación |
|---|---|---|---|
| **Lenguaje** | Python | 3.12+ | Tipado moderno, async nativo, ecosistema maduro |
| **Framework Web** | FastAPI | 0.110+ | Async, validación Pydantic, documentación automática |
| **ORM / DB** | SQLAlchemy 2.0 + asyncpg | 2.0+ | ORM relacional completo, soporte async, type hints |
| **Base de Datos** | Supabase (PostgreSQL 15+) | — | PostgreSQL gestionado, Auth integrado, RLS disponible |
| **Auth** | Supabase Auth | — | Delegación completa. FastAPI valida JWT localmente |
| **Validación JWT** | PyJWT | 2.8+ | Decodificación local del token Supabase sin peticiones de red |
| **Task Queue** | Celery + Redis | 5.3+ / 7.2+ | Motor de alertas en background, robusto y académico |
| **WebSocket** | FastAPI nativo | — | Streaming de precios al frontend (solo visualización) |
| **APIs Externas** | Finnhub (stocks) + CoinGecko (crypto) | — | 2 fuentes máximo para el TFM |
| **Logging** | Loguru | 0.7+ | Logs estructurados con rotación |
| **Testing** | pytest + pytest-asyncio + httpx | — | Tests unitarios e integración async |
| **Contenerización** | Docker + Docker Compose | — | Entorno reproducible para desarrollo y demo |

---

## 2. DECISIONES ARQUITECTÓNICAS CLAVE (ADRs)

### ADR-001: Auth delegada a Supabase Auth
- **Contexto**: El TFM no requiere reimplementar autenticación desde cero.
- **Decisión**: Usar Supabase Auth para registro/login. FastAPI valida el JWT localmente con `SUPABASE_JWT_SECRET`.
- **Consecuencias**: El backend no gestiona passwords, tokens de refresh ni emails de verificación. Todo eso lo maneja Supabase.

### ADR-002: SQLAlchemy + service_role key (bypass RLS)
- **Contexto**: `supabase-py` es un cliente HTTP sin ORM relacional. Nuestra DB tiene joins N:M, transactions y relaciones complejas.
- **Decisión**: SQLAlchemy 2.0 async se conecta directamente a PostgreSQL con `service_role key`. RLS queda habilitado como capa de seguridad adicional, pero el backend opera con privilegios elevados.
- **Consecuencias**: La autorización ("¿este usuario puede ver esta watchlist?") se implementa explícitamente en los **Use Cases**, no en RLS. Esto es coherente con Arquitectura Hexagonal.

### ADR-003: Separación WS (visualización) vs Background Tasks (alertas)
- **Contexto**: Evaluar alertas en tiempo real dentro del WebSocket introduce complejidad de estado, concurrencia y recuperación ante fallos.
- **Decisión**: WebSocket solo emite precios al frontend. Las alertas se evalúan con Celery cada 60 segundos.
- **Consecuencias**: Si el WS se cae, las alertas siguen funcionando. Si Celery se reinicia, no pierde estado (lee de la DB).

### ADR-004: Máximo 2 APIs externas en el TFM
- **Contexto**: Cada API tiene rate limits distintos, formatos de respuesta distintos y manejo de errores propio.
- **Decisión**: Finnhub para stocks/índices/forex. CoinGecko para criptomonedas. No se integrarán más APIs en el alcance del TFM.
- **Consecuencias**: El `market_data_provider` port tendrá 2 adaptadores concretos.

---

## 3. ESTRUCTURA DE CARPETAS DEFINITIVA

```
infinance-backend/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── __init__.py
│   ├── main.py                          # Punto de entrada FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py              # get_current_user, get_db, get_supabase_client
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth_routes.py           # POST /auth/refresh (si es necesario)
│   │   │   ├── watchlist_routes.py      # CRUD watchlists + assets
│   │   │   ├── alert_routes.py          # CRUD alertas
│   │   │   ├── market_routes.py         # GET precios actuales / históricos
│   │   │   ├── dividend_routes.py       # CRUD dividendos
│   │   │   └── notification_routes.py   # GET/PUT notificaciones del usuario
│   │   └── websocket/
│   │       ├── __init__.py
│   │       └── price_stream.py          # Endpoint WS /ws/prices
│   ├── core/
│   │   ├── __init__.py
│   │   ├── entities/
│   │   │   ├── __init__.py
│   │   │   ├── asset.py                 # Asset puro (dataclass/Pydantic)
│   │   │   ├── watchlist.py             # Watchlist + métodos de dominio
│   │   │   ├── alert.py                 # Alert + is_triggered(current_price)
│   │   │   ├── dividend.py              # Dividend puro
│   │   │   └── notification.py          # Notification puro
│   │   ├── ports/
│   │   │   ├── __init__.py
│   │   │   ├── asset_repository.py      # Interface: find_by_symbol, list_all
│   │   │   ├── watchlist_repository.py  # Interface: save, get_by_user, delete
│   │   │   ├── alert_repository.py      # Interface: save, get_active_by_user
│   │   │   ├── notification_repository.py
│   │   │   ├── market_data_provider.py  # Interface: get_price, get_historical
│   │   │   └── unit_of_work.py          # Interface para transactions
│   │   ├── use_cases/
│   │   │   ├── __init__.py
│   │   │   ├── watchlists/
│   │   │   │   ├── create_watchlist.py
│   │   │   │   ├── add_asset_to_watchlist.py
│   │   │   │   ├── remove_asset_from_watchlist.py
│   │   │   │   ├── list_user_watchlists.py
│   │   │   │   └── delete_watchlist.py
│   │   │   ├── alerts/
│   │   │   │   ├── create_alert.py
│   │   │   │   ├── update_alert.py
│   │   │   │   ├── delete_alert.py
│   │   │   │   └── list_user_alerts.py
│   │   │   └── market/
│   │   │       ├── fetch_asset_price.py
│   │   │       └── evaluate_alerts.py   # Lógica pura de evaluación
│   │   └── exceptions.py                # DomainError, NotFoundError, UnauthorizedError
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   ├── config.py                    # Pydantic Settings (.env)
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py            # Async engine + sessionmaker SQLAlchemy
│   │   │   ├── models.py                # DeclarativeBase + todos los modelos ORM
│   │   │   └── repositories/
│   │   │       ├── __init__.py
│   │   │       ├── sqlalchemy_asset_repo.py
│   │   │       ├── sqlalchemy_watchlist_repo.py
│   │   │       ├── sqlalchemy_alert_repo.py
│   │   │       ├── sqlalchemy_notification_repo.py
│   │   │       └── sqlalchemy_uow.py    # Unit of Work con SQLAlchemy
│   │   ├── external/
│   │   │   ├── __init__.py
│   │   │   ├── finnhub_client.py        # Adaptador MarketDataProvider
│   │   │   ├── coingecko_client.py      # Adaptador MarketDataProvider
│   │   │   └── rate_limiter.py          # Decorator/middleware rate limiting
│   │   └── celery/
│   │       ├── __init__.py
│   │       ├── config.py                # Celery app configuration
│   │       └── tasks/
│   │           ├── __init__.py
│   │           └── evaluate_alerts_task.py  # Task periódico
│   └── shared/
│       ├── __init__.py
│       ├── logger.py                    # Loguru configuration
│       └── utils.py                     # format_currency, parse_date, etc.
├── tests/
│   ├── __init__.py
│   ├── conftest.py                      # Fixtures pytest (db, client, auth)
│   ├── unit/
│   │   ├── test_entities.py             # is_triggered, validaciones dominio
│   │   └── test_use_cases.py            # Lógica pura con mocks
│   └── integration/
│       ├── test_auth_flow.py
│       ├── test_watchlist_crud.py
│       ├── test_alert_crud.py
│       └── test_market_endpoints.py
├── .env
├── .env                                 # NO versionar (gitignore)
├── requirements.txt
├── pyproject.toml                       # Poetry recomendado
└── README.md                            # Setup, arquitectura, decisiones
```

---

## 4. MODELO DE DATOS DEFINITIVO (SQL)

```sql
-- ==============================================================================
-- MODELO DE BASE DE DATOS INFINANCE — VERSIÓN DEFINITIVA (SIN updated_at)
-- ==============================================================================

-- 1. ENUMs (Catálogos de reglas)
CREATE TYPE asset_type AS ENUM ('stock', 'crypto', 'forex', 'index');
CREATE TYPE api_source AS ENUM ('finnhub', 'coingecko', 'alphavantage', 'twelvedata');
CREATE TYPE alert_type AS ENUM ('price_target', 'percent_variation', 'indicator', 'dividend');
CREATE TYPE alert_condition AS ENUM ('above', 'below', 'crosses_up', 'crosses_down');
CREATE TYPE error_level AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- 2. Catálogo de Activos Financieros
CREATE TABLE financial_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type asset_type NOT NULL,
    source_api api_source NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Perfiles de Usuario (extiende auth.users de Supabase)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Listas de Seguimiento (Watchlists)
CREATE TABLE user_watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla Puente: Activos en Watchlists
CREATE TABLE watchlist_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    watchlist_id UUID REFERENCES user_watchlists(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES financial_assets(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(watchlist_id, asset_id)
);

-- 6. Precios Históricos
CREATE TABLE asset_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES financial_assets(id) ON DELETE CASCADE NOT NULL,
    price NUMERIC(15, 4) NOT NULL,
    volume NUMERIC(20, 2),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source_api api_source NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(asset_id, timestamp, source_api)
);

-- 7. Dividendos
CREATE TABLE asset_dividends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES financial_assets(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(15, 4) NOT NULL,
    yield NUMERIC(5, 2),
    pay_date DATE NOT NULL,
    ex_dividend_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Alertas de Usuario
CREATE TABLE user_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES financial_assets(id) ON DELETE CASCADE NOT NULL,
    type alert_type NOT NULL,
    condition alert_condition,
    target_value NUMERIC(15, 4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Historial de Alertas Disparadas
CREATE TABLE alert_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    alert_id UUID REFERENCES user_alerts(id) ON DELETE SET NULL,
    triggered_price NUMERIC(15, 4),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Notificaciones de Usuario
CREATE TABLE user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    alert_id UUID REFERENCES user_alerts(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Logs de Errores del Sistema
CREATE TABLE system_error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level error_level NOT NULL,
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES
-- ==============================================================================
CREATE INDEX idx_asset_prices_asset_time ON asset_prices(asset_id, timestamp DESC);
CREATE INDEX idx_watchlists_user ON user_watchlists(user_id);
CREATE INDEX idx_watchlist_assets_watchlist ON watchlist_assets(watchlist_id);
CREATE INDEX idx_watchlist_assets_asset ON watchlist_assets(asset_id);
CREATE INDEX idx_alerts_user ON user_alerts(user_id);
CREATE INDEX idx_alerts_asset ON user_alerts(asset_id);
CREATE INDEX idx_alerts_active ON user_alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_dividends_asset ON asset_dividends(asset_id);
CREATE INDEX idx_notifications_user ON user_notifications(user_id, is_read);
CREATE INDEX idx_error_logs_level ON system_error_logs(level, created_at);

-- ==============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_error_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Usuario (ownership)
CREATE POLICY "User manages own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "User manages own watchlists" ON user_watchlists
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User manages own watchlist assets" ON watchlist_assets
    FOR ALL USING (EXISTS (SELECT 1 FROM user_watchlists WHERE id = watchlist_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM user_watchlists WHERE id = watchlist_id AND user_id = auth.uid()));

CREATE POLICY "User manages own alerts" ON user_alerts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User views own history" ON alert_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User manages own notifications" ON user_notifications
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas de Catálogos (lectura pública para autenticados)
CREATE POLICY "Authenticated read assets" ON financial_assets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read dividends" ON asset_dividends
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read prices" ON asset_prices
    FOR SELECT TO authenticated USING (true);

-- Política de Logs (solo service_role)
CREATE POLICY "Service role manages error logs" ON system_error_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## 5. FLUJO DE AUTENTICACIÓN (JWT)

```
┌─────────────┐     1. Login/Register      ┌──────────────┐
│   Cliente   │ ─────────────────────────> │ Supabase Auth│
│  (React)    │    (SDK Supabase Auth)     │  (nube)      │
└─────────────┘                            └──────────────┘
       │                                          │
       │<──────────────────────────────────────────┘
       │         2. Devuelve JWT (access_token)
       │
       │  3. Cada petición incluye:
       │     Authorization: Bearer <JWT>
       ▼
┌─────────────┐     4. FastAPI valida JWT     ┌──────────────┐
│   FastAPI   │  localmente con jwt.decode()   │   Supabase   │
│  (Backend)  │  usando SUPABASE_JWT_SECRET    │   (NO LLAMA) │
└──────────────┘                                └──────────────┘
       │
       │  5. Extrae user_id (sub) del payload
       │  6. Inyecta user_id en el endpoint
       ▼
┌─────────────┐     7. SQLAlchemy + service_role  ┌──────────────┐
│   Use Case  │  (bypass RLS, autorización en app)  │  PostgreSQL  │
│   (Lógica)  │                                       │   (Supabase) │
└─────────────┘                                       └──────────────┘
```

### Código de referencia: `dependencies.py`

```python
# src/api/dependencies.py
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import InvalidTokenError

security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extrae y valida el user_id desde el JWT de Supabase."""
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token sin subject")
        return user_id
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
```

---

## 6. ESTRATEGIA DE TIEMPO REAL

### 6.1 WebSocket — Streaming de Precios (Visualización)

**Responsabilidad única**: Emitir precios actuales al frontend. Sin lógica de negocio.

```python
# src/api/websocket/price_stream.py (referencia)
from fastapi import WebSocket, WebSocketDisconnect

class PriceStreamManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, symbol: str):
        await websocket.accept()
        if symbol not in self.active_connections:
            self.active_connections[symbol] = []
        self.active_connections[symbol].append(websocket)

    async def broadcast(self, symbol: str, price: float):
        for conn in self.active_connections.get(symbol, []):
            await conn.send_json({"symbol": symbol, "price": price})
```

**Flujo**:
1. Cliente se conecta a `ws://api/ws/prices?symbol=BTC`
2. FastAPI abre conexión y se suscribe al stream de Finnhub/CoinGecko
3. Cada tick recibido se reenvía al cliente sin procesar
4. Si se cae el WS, el cliente se reconecta. No hay estado crítico.

### 6.2 Celery — Motor de Alertas (Lógica de Negocio)

**Responsabilidad**: Evaluar alertas activas y registrar disparos.

```python
# src/infrastructure/celery/tasks/evaluate_alerts_task.py (referencia)
from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession

@shared_task
async def evaluate_alerts_task():
    """Task que corre cada 60 segundos."""
    # 1. Obtener todas las alertas activas
    # 2. Para cada alerta, consultar precio actual (cache o API)
    # 3. Evaluar alert.is_triggered(current_price)
    # 4. Si se cumple: crear AlertHistory + UserNotification
    # 5. Opcional: enviar push notification
    pass
```

**Configuración del beat**:
```python
# celery beat schedule
celery_app.conf.beat_schedule = {
    "evaluate-alerts-every-60s": {
        "task": "src.infrastructure.celery.tasks.evaluate_alerts_task",
        "schedule": 60.0,
    },
}
```

---

## 7. VARIABLES DE ENTORNO (`.env`)

```bash
# =============================================================================
# INFINANCE BACKEND — VARIABLES DE ENTORNO
# =============================================================================

# --- FastAPI ---
APP_NAME="InFinance API"
APP_VERSION="1.0.0"
DEBUG=false
PORT=8000

# --- Supabase Auth (validación JWT local) ---
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-settings

# --- Base de Datos (SQLAlchemy async) ---
# Usar service_role key para conexión directa a PostgreSQL
DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.xxxx.supabase.co:5432/postgres

# --- APIs Externas ---
FINNHUB_API_KEY=your_finnhub_key
COINGECKO_API_KEY=your_coingecko_key  # opcional, la API gratuita funciona sin key

# --- Celery / Redis ---
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# --- Logging ---
LOG_LEVEL=INFO
```

---

## 8. ROADMAP DE SPRINTS (14 semanas)

| Sprint | Semana | Entregable | Criterios de Aceptación + TDD |
|---|---|---|---|
| **0** | 1 | Setup proyecto + Testing | Estructura de carpetas, Docker Compose (FastAPI + PostgreSQL local + Redis), `main.py` levanta sin errores. `conftest.py` y fixtures base funcionando. Al menos 1 test de "hola mundo" pasa. |
| **1** | 2 | Auth + Middleware JWT | Endpoint protegido de prueba. `get_current_user` extrae UUID válido. **TDD**: Tests de integración para JWT válido/inválido escritos ANTES del endpoint. |
| **2** | 3 | Catálogo de Assets | Seed de ~50 activos (stocks + crypto). CRUD básico. `AssetRepository` implementado. **TDD**: Entidad `Asset` testeada con validaciones de dominio antes de tocar la ruta. |
| **3** | 4 | Watchlists (CRUD) | Crear, listar, eliminar watchlists. Añadir/quitar assets. Tests de integración completos. **TDD**: Use cases `CreateWatchlist` y `AddAssetToWatchlist` con mocks antes de implementar rutas. |
| **4** | 5 | Alerts (CRUD) | Crear alertas con validaciones de dominio (`target_value >= 0`). `Alert.is_triggered()` implementado. **TDD**: Entidad `Alert` testeada al 100% con todas las condiciones (`above`, `below`, etc.) antes de la capa de infraestructura. |
| **5** | 6-7 | Conector Finnhub | `FinnhubClient` implementa `MarketDataProvider`. Rate limiting funcional. Guarda precios en `asset_prices`. **TDD**: Rate limiter testeado con mocks de tiempo. Cliente HTTP testeado con `responses` o cassettes. |
| **6** | 8 | Conector CoinGecko | `CoinGeckoClient` implementa `MarketDataProvider`. Unificación de interfaz. **TDD**: Tests de integración del adapter con la interfaz común. |
| **7** | 9 | Celery + Motor de Alertas | Task periódico cada 60s. Evalúa alertas activas. Crea registros en `alert_history` y `user_notifications`. **TDD**: `EvaluateAlerts` use case puro testeado con mocks antes de conectar Celery. |
| **8** | 10 | WebSocket Precios | Endpoint `/ws/prices` emite ticks en tiempo real. Reconexión automática desde cliente. **TDD**: Tests de integración de conexión, broadcast y desconexión. |
| **9** | 11 | Dividendos + Notificaciones | CRUD dividendos. Endpoint de notificaciones del usuario (GET / PATCH is_read). **TDD**: Use cases testeados con mocks. |
| **10** | 12 | Coverage + Documentación | >=75% coverage global, >=90% en `core/`. README técnico. Diagrama de arquitectura. Historial de commits demostrando ciclos Red-Green-Refactor. |
| **11** | 13 | Pulido + Demo | Manejo de errores robusto. Logs en `system_error_logs`. Preparar escenario de demo. Suite de tests completa pasa en CI. |
| **12** | 14 | Buffer | Bugs, ajustes finales, memoria del TFM. Regresión completa de tests. |

---

## 9. PRINCIPIOS Y PATRONES APLICADOS

| Principio | Aplicación en el proyecto |
|---|---|
| **Arquitectura Hexagonal** | `core/` contiene dominio puro. `api/` e `infrastructure/` son adaptadores. El dominio no depende de frameworks. |
| **Dependency Inversion** | Los use cases dependen de `ports/` (interfaces), no de implementaciones concretas. |
| **Repository Pattern** | Cada entidad tiene su puerto (`AssetRepositoryPort`) e implementación (`SQLAlchemyAssetRepository`). |
| **Unit of Work** | Las transacciones de DB se manejan explícitamente, permitiendo rollback en caso de error. |
| **Single Responsibility** | Cada archivo tiene una función única: rutas reciben HTTP, use cases contienen lógica, repositorios acceden a DB. |
| **DRY** | Configuración centralizada en `config.py`. Logger compartido. Dependencias inyectadas. |
| **Fail Fast** | Validaciones de dominio en entidades (`Alert` rechaza `target_value` negativo). |

---

## 10. ESTRATEGIA DE TESTING Y TDD (Test Driven Development)

> **Filosofía**: En InFinance, TDD no es una religión del 100% coverage. Es una **herramienta de diseño** que garantiza que el dominio (entidades + use cases) esté correctamente modelado antes de tocar infraestructura. Se aplica con rigor en `core/`, con pragmatismo en `api/` e `infrastructure/`.

### 10.1. Pirámide de Testing

```
         /\
        /  \     E2E (1-2 tests críticos)
       /____\    ---
      /      \   Integration (endpoints + DB + auth)
     /________\  ---
    /          \  Unit (entidades + use cases + mocks)
   /____________\
```

| Nivel | Cobertura objetivo | Qué se testea | Herramientas |
|---|---|---|---|
| **Unit** | >=80% en `core/` | Entidades, use cases, validaciones de dominio | pytest, pytest-asyncio, unittest.mock |
| **Integration** | >=60% en `api/routes/` | Endpoints HTTP, DB real (test DB), JWT, serialización | pytest, httpx, TestClient de FastAPI, asyncpg |
| **E2E** | 2-3 flujos críticos | Login -> Crear watchlist -> Añadir asset -> Crear alerta | pytest + script de flujo completo |

### 10.2. TDD por Capa

#### A) Capa de Dominio (`core/`) — TDD Estricto

Aquí se aplica el ciclo **Red -> Green -> Refactor** sin excepciones.

**Regla**: No se escribe código de producción en `core/` sin que exista primero un test que falle.

**Ejemplo — Ciclo TDD para `Alert.is_triggered()`**:

```python
# tests/unit/test_entities.py
# PASO 1: RED — Escribir el test ANTES de la entidad

import pytest
from src.core.entities.alert import Alert

class TestAlertEntity:
    def test_is_triggered_above_when_price_exceeds_target(self):
        alert = Alert(
            id=None,
            user_id="uuid-1",
            asset_id="uuid-btc",
            type="price_target",
            condition="above",
            target_value=50000.00,
            is_active=True
        )
        assert alert.is_triggered(current_price=51000.00) is True

    def test_is_triggered_above_when_price_below_target(self):
        alert = Alert(
            id=None,
            user_id="uuid-1",
            asset_id="uuid-btc",
            type="price_target",
            condition="above",
            target_value=50000.00,
            is_active=True
        )
        assert alert.is_triggered(current_price=49000.00) is False

    def test_alert_with_negative_target_raises_domain_error(self):
        with pytest.raises(DomainError, match="target_value must be non-negative"):
            Alert(
                id=None,
                user_id="uuid-1",
                asset_id="uuid-btc",
                type="price_target",
                condition="above",
                target_value=-100.00,  # Inválido
                is_active=True
            )
```

```python
# src/core/entities/alert.py
# PASO 2: GREEN — Implementación mínima para que pasen los tests

from dataclasses import dataclass
from src.core.exceptions import DomainError

@dataclass
class Alert:
    id: str | None
    user_id: str
    asset_id: str
    type: str
    condition: str
    target_value: float
    is_active: bool

    def __post_init__(self):
        if self.target_value is not None and self.target_value < 0:
            raise DomainError("target_value must be non-negative")

    def is_triggered(self, current_price: float) -> bool:
        if not self.is_active:
            return False
        if self.condition == "above":
            return current_price > self.target_value
        if self.condition == "below":
            return current_price < self.target_value
        return False
```

```python
# PASO 3: REFACTOR — Mejorar sin romper tests
# (ej. extraer lógica a un strategy pattern si crecen las condiciones)
```

#### B) Capa de Use Cases (`core/use_cases/`) — TDD con Mocks

Los use cases dependen de puertos (interfaces). En tests se inyectan **mocks** que implementan esas interfaces.

**Ejemplo — `CreateWatchlistUseCase`**:

```python
# tests/unit/test_use_cases.py
# RED: Test primero

import pytest
from unittest.mock import AsyncMock
from src.core.use_cases.watchlists.create_watchlist import CreateWatchlistUseCase
from src.core.exceptions import UnauthorizedError

class TestCreateWatchlist:
    @pytest.mark.asyncio
    async def test_creates_watchlist_successfully(self):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.save.return_value = Watchlist(id="w-1", user_id="u-1", name="Tech")

        use_case = CreateWatchlistUseCase(watchlist_repo=mock_repo)

        # Act
        result = await use_case.execute(user_id="u-1", name="Tech")

        # Assert
        assert result.name == "Tech"
        assert result.user_id == "u-1"
        mock_repo.save.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_raises_error_if_name_empty(self):
        use_case = CreateWatchlistUseCase(watchlist_repo=AsyncMock())

        with pytest.raises(DomainError, match="name cannot be empty"):
            await use_case.execute(user_id="u-1", name="")
```

```python
# src/core/use_cases/watchlists/create_watchlist.py
# GREEN: Implementación mínima

from src.core.entities.watchlist import Watchlist
from src.core.ports.watchlist_repository import WatchlistRepositoryPort
from src.core.exceptions import DomainError

class CreateWatchlistUseCase:
    def __init__(self, watchlist_repo: WatchlistRepositoryPort):
        self.repo = watchlist_repo

    async def execute(self, user_id: str, name: str) -> Watchlist:
        if not name or not name.strip():
            raise DomainError("name cannot be empty")

        watchlist = Watchlist(id=None, user_id=user_id, name=name.strip())
        return await self.repo.save(watchlist)
```

#### C) Capa de Infraestructura (`infrastructure/`) — Tests de Integración

Los repositorios SQLAlchemy se testean contra una **base de datos de test** (PostgreSQL local en Docker, no Supabase remoto).

```python
# tests/integration/test_watchlist_crud.py

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_watchlist_requires_auth(client: AsyncClient):
    response = await client.post("/watchlists", json={"name": "Crypto"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_user_cannot_see_other_user_watchlist(
    client: AsyncClient, auth_headers_user_a, auth_headers_user_b
):
    # User A crea una watchlist
    resp_a = await client.post("/watchlists", json={"name": "Privada"}, headers=auth_headers_user_a)
    watchlist_id = resp_a.json()["id"]

    # User B intenta verla
    resp_b = await client.get(f"/watchlists/{watchlist_id}", headers=auth_headers_user_b)
    assert resp_b.status_code == 403  # o 404, según decisión de diseño
```

### 10.3. Estructura de Tests en el Proyecto

```
tests/
├── conftest.py                          # Fixtures globales
├── fixtures/
│   ├── __init__.py
│   ├── auth_fixtures.py                 # JWT de prueba, headers autenticados
│   ├── db_fixtures.py                   # Engine de test, session, rollback
│   └── domain_fixtures.py               # Instancias de entidades de ejemplo
├── unit/
│   ├── core/
│   │   ├── test_alert_entity.py         # is_triggered, validaciones
│   │   ├── test_watchlist_entity.py
│   │   └── test_asset_entity.py
│   └── use_cases/
│       ├── test_create_watchlist.py     # Con mocks
│       ├── test_add_asset_to_watchlist.py
│       ├── test_create_alert.py
│       └── test_evaluate_alerts.py      # Lógica pura, sin DB
├── integration/
│   ├── api/
│   │   ├── test_auth_middleware.py
│   │   ├── test_watchlist_routes.py     # Con TestClient + DB real
│   │   ├── test_alert_routes.py
│   │   └── test_market_routes.py
│   └── infrastructure/
│       ├── test_sqlalchemy_repositories.py
│       └── test_finnhub_client.py       # Con responses mock o cassette
└── e2e/
    └── test_full_user_journey.py        # Un solo flujo end-to-end
```

### 10.4. Fixtures Clave (`conftest.py`)

```python
# tests/conftest.py

import pytest
import pytest_asyncio
from httpx import AsyncClient
from fastapi import FastAPI
from src.main import app

@pytest_asyncio.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def db_session():
    """Sesión de DB de test con rollback automático."""
    from src.infrastructure.database.connection import async_test_session
    async with async_test_session() as session:
        yield session
        await session.rollback()

@pytest.fixture
def auth_headers():
    """Genera un JWT de prueba válido para un usuario ficticio."""
    import jwt, os, uuid
    user_id = str(uuid.uuid4())
    token = jwt.encode(
        {"sub": user_id, "aud": "authenticated"},
        os.getenv("SUPABASE_JWT_SECRET"),
        algorithm="HS256"
    )
    return {"Authorization": f"Bearer {token}"}
```

### 10.5. Política de Coverage

| Métrica | Umbral | Justificación |
|---|---|---|
| `core/entities/` | 100% | Lógica de negocio pura. Cada rama debe estar testeada. |
| `core/use_cases/` | >=90% | Lógica de aplicación. Mocks permiten cubrir casos de error. |
| `core/ports/` | 0% | Son interfaces (protocols/ABC). No tienen lógica. |
| `infrastructure/repositories/` | >=70% | CRUD básico. Tests de integración. |
| `infrastructure/external/` | >=60% | Rate limiting, manejo de errores de APIs. |
| `api/routes/` | >=70% | Status codes, serialización, validación de entrada. |
| **Global** | >=75% | Objetivo realista para un TFM con deadline. |

### 10.6. TDD en el Roadmap de Sprints

TDD no es un sprint apartado. Se aplica **en cada sprint**, con esta distribución:

| Sprint | Foco TDD | Qué se testea |
|---|---|---|
| **0** | Setup de testing | `conftest.py`, fixtures, DB de test en Docker. Un test "hola mundo" que pase. |
| **1** | Auth + Middleware | Test de integración: JWT válido permite acceso, JWT inválido devuelve 401. |
| **2** | Entidad `Asset` | Test unitario: `Asset` se instancia correctamente, validaciones de `symbol`. |
| **3** | Use Cases Watchlist | `CreateWatchlist`, `AddAssetToWatchlist` con mocks. Tests de integración para endpoints. |
| **4** | Entidad `Alert` + Use Cases | `is_triggered()` con todas las condiciones. `CreateAlert` con validaciones de dominio. |
| **5-6** | Conectores externos | Tests con `responses` (biblioteca) o cassettes VCR. Rate limiter con mocks de tiempo. |
| **7** | Motor de alertas | `EvaluateAlerts` use case puro. Task de Celery con mocks de repositorio. |
| **8** | WebSocket | Test de integración: conexión, broadcast, desconexión limpia. |
| **9-12** | Regresión + Coverage | Ejecutar suite completa. Subir coverage donde falte. Tests E2E del flujo crítico. |

### 10.7. Anti-patrones a evitar

| Anti-patrón | Por qué es malo | Solución |
|---|---|---|
| Testear la DB en tests unitarios | Rompe la regla de unit tests (deben ser rápidos y aislados) | Usar mocks para repositorios en unit tests. DB solo en integration. |
| Testear implementaciones, no comportamiento | Si cambias la implementación, los tests se rompen innecesariamente | Testear qué hace el use case, no cómo lo hace internamente. |
| Ignorar tests async | FastAPI es async. Tests síncronos dan falsos positivos/negativos | Usar `pytest.mark.asyncio` y `AsyncMock`. |
| TDD en todo (incluyendo infraestructura trivial) | Pierdes tiempo testeando getters/setters o config | Aplicar TDD estricto solo en `core/`. En infraestructura, testear lo que tiene lógica (rate limiter, mapeos complejos). |
| No testear el camino feliz Y el de error | Solo testear éxito deja agujeros de seguridad | Cada use case debe tener al menos: 1 test éxito, 1 test error de dominio, 1 test error de infraestructura. |

---

## 11. CRITERIOS DE ÉXITO DEL TFM

1. **Arquitectura demostrable**: El tribunal puede seguir el flujo de una petición desde la ruta hasta la DB sin encontrar lógica de negocio en capas de infraestructura.
2. **Seguridad funcional**: Un usuario no puede ver ni modificar datos de otro usuario. Validado con tests de integración.
3. **Tiempo real funcional**: El WebSocket muestra precios actualizándose. Las alertas se evalúan y registran en `alert_history`.
4. **Código testeado con TDD**: >=75% coverage global. `core/` con >=90% y testeado con TDD estricto (Red-Green-Refactor demostrable en el historial de commits).
5. **Documentación técnica**: README con instrucciones de setup, decisiones arquitectónicas (ADRs), diagrama de componentes y guía de testing.

---

*Documento generado para el Trabajo de Fin de Máster — InFinance.*
*Arquitectura Hexagonal | FastAPI | Supabase | SQLAlchemy | TDD*
