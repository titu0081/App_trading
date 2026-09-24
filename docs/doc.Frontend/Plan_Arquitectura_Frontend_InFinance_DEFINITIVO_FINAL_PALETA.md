# PLAN DE ARQUITECTURA FRONTEND — INFINANCE

## Versión Definitiva | React Native + Expo + Arquitectura Modular por Features + Clean Architecture + TDD

---

## 0. PROPÓSITO DEL DOCUMENTO

Este documento define la arquitectura técnica definitiva del frontend móvil de **InFinance** y servirá como guía de construcción de la aplicación durante el Trabajo de Fin de Máster.

La aplicación móvil será desarrollada con **React Native mediante Expo y TypeScript**, y se organizará mediante una **arquitectura modular orientada a funcionalidades (Feature-Based Architecture)**. Dentro de cada módulo se aplicarán principios de **Clean Architecture**, **Dependency Inversion**, **Single Responsibility** y **Test Driven Development (TDD)**.

La arquitectura del frontend no replica de forma literal la arquitectura hexagonal del backend. En cambio, conserva sus principios principales: separación de responsabilidades, aislamiento de la lógica de negocio, dependencia hacia abstracciones, infraestructura desacoplada y pruebas automatizadas desde el inicio.

### Objetivos arquitectónicos

1. Separar la interfaz de usuario de la lógica de aplicación.
2. Evitar que las pantallas dependan directamente de Axios, Supabase, WebSocket o SecureStore.
3. Organizar la aplicación por funcionalidades relacionadas con las historias de usuario.
4. Facilitar pruebas unitarias, de integración y end-to-end.
5. Mantener una estructura escalable sin introducir sobreingeniería.
6. Garantizar trazabilidad entre historias de usuario, features, casos de uso y tests.
7. Mantener coherencia conceptual con la arquitectura backend de InFinance.

---

# 1. STACK TECNOLÓGICO DEFINITIVO

| Capa / Responsabilidad  | Tecnología                   | Decisión               | Justificación                                                               |
| ----------------------- | ---------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Lenguaje                | TypeScript                   | Definitivo             | Tipado estático, mejor mantenibilidad y soporte del ecosistema React Native |
| Framework móvil         | React Native                 | Definitivo             | Desarrollo multiplataforma Android/iOS                                      |
| Toolchain               | Expo                         | Definitivo             | Simplifica configuración, build, navegación y APIs nativas                  |
| Navegación              | Expo Router                  | Definitivo             | Routing basado en archivos y layouts, integrado con React Navigation        |
| Server State            | TanStack Query               | Definitivo             | Cache, sincronización, refetch, loading/error y manejo de datos remotos     |
| Client State            | Zustand                      | Definitivo             | Estado global pequeño, simple y desacoplado                                 |
| Formularios             | React Hook Form              | Definitivo             | Manejo eficiente de formularios y validaciones                              |
| Validación              | Zod                          | Definitivo             | Esquemas tipados reutilizables                                              |
| HTTP                    | Axios                        | Definitivo             | Cliente HTTP centralizable con interceptores                                |
| Autenticación           | Supabase Auth                | Definitivo             | Registro, login y gestión de sesión                                         |
| Almacenamiento sensible | Expo SecureStore             | Definitivo             | Persistencia segura de información sensible en dispositivo                  |
| Tiempo real             | WebSocket encapsulado        | Definitivo             | Recepción de precios en tiempo real desde FastAPI                           |
| Gráficos                | Adaptador de gráficos        | Definitivo como patrón | Evita acoplar features a una librería gráfica específica                    |
| Unit testing            | Jest                         | Definitivo             | Tests unitarios y coverage                                                  |
| Component testing       | React Native Testing Library | Definitivo             | Pruebas de comportamiento de componentes                                    |
| API mocking             | MSW / mocks controlados      | Recomendado            | Simulación de respuestas HTTP                                               |
| E2E                     | Maestro                      | Recomendado            | Automatización de journeys móviles críticos                                 |
| Lint                    | ESLint                       | Definitivo             | Consistencia estática                                                       |
| Format                  | Prettier                     | Definitivo             | Formato automático                                                          |
| Git hooks               | Husky + lint-staged          | Recomendado            | Validaciones antes de commit                                                |

---

# 2. PRINCIPIO ARQUITECTÓNICO CENTRAL

La arquitectura seleccionada es:

> **Arquitectura Modular Orientada a Funcionalidades (Feature-Based Architecture), aplicando principios de Clean Architecture y Dependency Inversion.**

La unidad principal de organización es la **feature**, no la capa técnica global.

Ejemplos:

- `auth`
- `market`
- `watchlists`
- `alerts`
- `charts`
- `notifications`
- `profile`

Cada feature podrá contener, únicamente cuando sea necesario:

- `domain/`
- `data/`
- `presentation/`

No se crearán capas vacías por obligación arquitectónica.

### Regla YAGNI

Una abstracción se añade cuando existe una responsabilidad o variación concreta que la justifique.

No se crearán:

- interfaces sin consumidores;
- mappers cuando API y dominio tengan exactamente la misma forma;
- use cases que únicamente reenvían un argumento sin aportar comportamiento;
- stores globales para estado local de una pantalla;
- repositorios para componentes puramente visuales.

---

# 3. REGLA DE DEPENDENCIAS

La regla fundamental es:

```text
Presentation
     │
     ▼
Domain / Application
     ▲
     │
Data
     │
     ▼
Infrastructure
```

La dirección lógica de dependencias se mantiene hacia el dominio.

## 3.1 Presentation

Puede depender de:

- use cases;
- tipos de dominio;
- hooks propios de la feature;
- componentes compartidos.

No debe depender directamente de:

- Axios;
- Supabase client;
- SecureStore;
- WebSocket;
- URLs del backend.

## 3.2 Domain

Debe permanecer independiente de:

- React;
- React Native;
- Expo;
- Axios;
- Supabase;
- Zustand;
- TanStack Query.

Contiene lógica de aplicación que pueda probarse sin montar una interfaz.

## 3.3 Data

Implementa contratos definidos por el dominio.

Puede conocer:

- DTOs;
- mappers;
- API clients;
- fuentes remotas.

## 3.4 Infrastructure

Contiene detalles técnicos compartidos:

- configuración;
- HTTP;
- autenticación;
- almacenamiento;
- WebSocket;
- logging;
- servicios de plataforma.

---

# 4. DECISIONES ARQUITECTÓNICAS CLAVE (ADRs)

## ADR-001: Organización Feature-Based

**Contexto:** InFinance está definido mediante historias de usuario claramente diferenciadas: autenticación, mercados, watchlists, alertas, gráficos, notificaciones e historial.

**Decisión:** Organizar el código por funcionalidad y no por capas técnicas globales.

**Consecuencias:**

- mayor cohesión;
- menor acoplamiento entre funcionalidades;
- cada feature puede evolucionar de forma independiente;
- la trazabilidad con el Product Backlog es directa.

## ADR-002: Clean Architecture pragmática dentro de cada feature

**Contexto:** Una Clean Architecture estricta introduce demasiada ceremonia para una aplicación móvil de TFM.

**Decisión:** Aplicar separación `domain/data/presentation` únicamente en features con lógica significativa.

**Consecuencia:** Se mantiene testeabilidad sin generar boilerplate innecesario.

## ADR-003: Expo Router para navegación

**Decisión:** Utilizar Expo Router como punto de entrada de navegación.

**Reglas:**

- `app/` contiene rutas y layouts;
- las pantallas reales pertenecen a `src/features/.../presentation/screens`;
- los archivos de `app/` deben ser wrappers mínimos.

Ejemplo:

```tsx
// app/(app)/watchlists/index.tsx
export { WatchlistsScreen as default } from "@/features/watchlists/presentation/screens/WatchlistsScreen";
```

## ADR-004: Supabase se utiliza directamente desde frontend únicamente para Auth

**Decisión:** React Native utilizará Supabase directamente para:

- register;
- login;
- logout;
- refresh de sesión;
- recuperación de sesión.

El frontend **no accederá directamente a las tablas de PostgreSQL/Supabase** para:

- watchlists;
- alertas;
- assets;
- precios;
- historial;
- notificaciones.

Estas operaciones se realizarán mediante FastAPI.

## ADR-005: FastAPI es la API de negocio de InFinance

Todas las operaciones de negocio pasan por el backend.

```text
React Native
    │
    ▼
Repository
    │
    ▼
FastAPI
    │
    ▼
Use Cases Backend
    │
    ▼
PostgreSQL / APIs externas
```

## ADR-006: TanStack Query administra Server State

Se considera Server State todo dato cuyo origen de verdad sea FastAPI:

- activos;
- precios históricos;
- watchlists;
- alertas;
- historial;
- notificaciones;
- dividendos.

TanStack Query administrará:

- cache;
- loading;
- error;
- stale data;
- invalidation;
- refetch;
- mutations.

## ADR-007: Zustand administra únicamente Client State global

Zustand se utilizará para estado que no provenga del servidor.

Ejemplos:

- preferencias visuales;
- filtros globales;
- intervalo seleccionado global cuando sea necesario;
- configuraciones locales;
- flags de onboarding.

No se duplicarán en Zustand los datos administrados por TanStack Query.

## ADR-008: Sesión y credenciales sensibles se encapsulan

La sesión no será manipulada directamente desde pantallas.

Se creará una abstracción:

```text
SessionManager
```

Responsabilidades:

- obtener sesión actual;
- obtener access token;
- escuchar cambios de autenticación;
- cerrar sesión;
- coordinar SecureStore cuando sea necesario.

## ADR-009: HTTP centralizado

Existirá un único `ApiClient`.

Responsabilidades:

- baseURL;
- timeout;
- cabeceras;
- JWT;
- serialización;
- normalización de errores;
- logging controlado.

Las features no crearán instancias independientes de Axios.

## ADR-010: WebSocket es infraestructura

La UI nunca ejecutará directamente:

```ts
new WebSocket(...)
```

La conexión se encapsulará en una interfaz `PriceStream`.

Esto permitirá:

- reconexión;
- unsubscribe;
- mocks;
- pruebas;
- reemplazo futuro.

## ADR-011: TDD estricto para lógica, pragmático para UI

TDD se utilizará de forma estricta en:

- entidades con reglas;
- value objects cuando existan;
- use cases;
- transformaciones con lógica;
- hooks con comportamiento relevante.

Los componentes visuales se probarán por comportamiento.

## ADR-012: No usar Redux como arquitectura

Redux no es necesario para el alcance actual.

La separación será:

```text
TanStack Query -> server state
Zustand        -> client state
React state    -> local component state
```

## ADR-013: Los DTO no salen de la capa Data

Los modelos recibidos de FastAPI no deben consumirse directamente en Presentation cuando su forma sea distinta al dominio.

Flujo:

```text
API JSON
  ↓
DTO
  ↓
Mapper
  ↓
Domain Entity
  ↓
Presentation
```

## ADR-014: Errores normalizados

La UI no evaluará códigos HTTP directamente.

Incorrecto:

```ts
if (error.response?.status === 401) { ... }
```

Correcto:

```text
AxiosError
   ↓
ApiErrorMapper
   ↓
ApplicationError
   ↓
Presentation
```

---

# 5. ESTRUCTURA DE CARPETAS DEFINITIVA

```text
infinance-mobile/
│
├── app/
│   ├── _layout.tsx
│   ├── +not-found.tsx
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   └── (app)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── market/
│       │   ├── index.tsx
│       │   └── [symbol].tsx
│       ├── watchlists/
│       │   ├── index.tsx
│       │   └── [id].tsx
│       ├── alerts/
│       │   ├── index.tsx
│       │   ├── create.tsx
│       │   └── history.tsx
│       ├── notifications/
│       │   └── index.tsx
│       └── profile/
│           └── index.tsx
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── entities/UserSession.ts
│   │   │   │   ├── repositories/AuthRepository.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── Login.ts
│   │   │   │       ├── Register.ts
│   │   │   │       └── Logout.ts
│   │   │   ├── data/repositories/SupabaseAuthRepository.ts
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       │   ├── LoginScreen.tsx
│   │   │       │   └── RegisterScreen.tsx
│   │   │       ├── components/
│   │   │       └── hooks/useAuth.ts
│   │   │
│   │   ├── market/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Asset.ts
│   │   │   │   │   └── AssetPrice.ts
│   │   │   │   ├── repositories/MarketRepository.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetAssets.ts
│   │   │   │       ├── GetAssetDetail.ts
│   │   │   │       └── GetHistoricalPrices.ts
│   │   │   ├── data/
│   │   │   │   ├── dto/
│   │   │   │   ├── mappers/
│   │   │   │   └── repositories/ApiMarketRepository.ts
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       ├── components/
│   │   │       └── hooks/
│   │   │
│   │   ├── watchlists/
│   │   │   ├── domain/
│   │   │   │   ├── entities/Watchlist.ts
│   │   │   │   ├── repositories/WatchlistRepository.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetWatchlists.ts
│   │   │   │       ├── CreateWatchlist.ts
│   │   │   │       ├── DeleteWatchlist.ts
│   │   │   │       ├── AddAssetToWatchlist.ts
│   │   │   │       └── RemoveAssetFromWatchlist.ts
│   │   │   ├── data/
│   │   │   │   ├── dto/
│   │   │   │   ├── mappers/
│   │   │   │   └── repositories/ApiWatchlistRepository.ts
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       ├── components/
│   │   │       └── hooks/
│   │   │
│   │   ├── alerts/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Alert.ts
│   │   │   │   │   └── AlertHistoryEntry.ts
│   │   │   │   ├── repositories/AlertRepository.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetAlerts.ts
│   │   │   │       ├── CreateAlert.ts
│   │   │   │       ├── UpdateAlert.ts
│   │   │   │       ├── DeleteAlert.ts
│   │   │   │       └── GetAlertHistory.ts
│   │   │   ├── data/
│   │   │   │   ├── dto/
│   │   │   │   ├── mappers/
│   │   │   │   └── repositories/ApiAlertRepository.ts
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       ├── components/
│   │   │       └── hooks/
│   │   │
│   │   ├── charts/
│   │   │   ├── domain/models/ChartPoint.ts
│   │   │   └── presentation/
│   │   │       ├── components/PriceChart.tsx
│   │   │       └── adapters/ChartAdapter.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── domain/
│   │   │   │   ├── entities/Notification.ts
│   │   │   │   ├── repositories/NotificationRepository.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetNotifications.ts
│   │   │   │       └── MarkNotificationAsRead.ts
│   │   │   ├── data/repositories/ApiNotificationRepository.ts
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       ├── components/
│   │   │       └── hooks/
│   │   │
│   │   └── profile/
│   │       └── presentation/
│   │           ├── screens/
│   │           └── components/
│   │
│   ├── infrastructure/
│   │   ├── api/
│   │   │   ├── ApiClient.ts
│   │   │   ├── apiConfig.ts
│   │   │   ├── authInterceptor.ts
│   │   │   └── ApiErrorMapper.ts
│   │   ├── auth/
│   │   │   ├── supabaseClient.ts
│   │   │   └── SessionManager.ts
│   │   ├── websocket/
│   │   │   ├── PriceStream.ts
│   │   │   ├── FastApiPriceStream.ts
│   │   │   └── ReconnectionPolicy.ts
│   │   ├── storage/
│   │   │   ├── SecureStorage.ts
│   │   │   └── ExpoSecureStorage.ts
│   │   └── config/env.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppInput.tsx
│   │   │   ├── LoadingView.tsx
│   │   │   ├── ErrorView.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── errors/
│   │   │   ├── ApplicationError.ts
│   │   │   └── errorMessages.ts
│   │   ├── hooks/
│   │   ├── constants/
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   └── AuthProvider.tsx
│   │
│   └── store/
│       ├── preferencesStore.ts
│       └── marketFiltersStore.ts
│
├── tests/
│   ├── setup/
│   │   ├── jest.setup.ts
│   │   └── testUtils.tsx
│   ├── unit/
│   ├── integration/
│   └── e2e/
│       ├── auth-flow.yaml
│       ├── watchlist-flow.yaml
│       └── alert-flow.yaml
│
├── assets/
├── .env
├── .env
├── .gitignore
├── app.json
├── babel.config.js
├── eslint.config.js
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

# 6. MAPEO DE HISTORIAS DE USUARIO A FEATURES

| Historia | Feature             | Responsabilidad principal              |
| -------- | ------------------- | -------------------------------------- |
| H1       | `auth`              | Registro, login, logout, sesión        |
| H2       | `market`            | Consulta de información financiera     |
| H3       | `watchlists`        | CRUD de listas y activos               |
| H4       | `alerts`            | CRUD y configuración de alertas        |
| H5       | `charts` + `market` | Visualización histórica/intradía       |
| H6       | `notifications`     | Recepción y consulta de notificaciones |
| H7       | `alerts/history`    | Historial de alertas disparadas        |

La relación deseada es:

```text
Historia de Usuario
       ↓
Feature
       ↓
Use Case
       ↓
Repository Contract
       ↓
Implementation
       ↓
FastAPI / Supabase Auth / WS
       ↓
Tests
```

---

# 7. NAVEGACIÓN

## 7.1 Grupos principales

```text
app/
├── (auth)
└── (app)
```

### `(auth)`

Accesible cuando no existe sesión autenticada.

Rutas:

- `/login`
- `/register`

### `(app)`

Accesible únicamente con sesión válida.

Rutas principales:

- `/`
- `/market`
- `/market/[symbol]`
- `/watchlists`
- `/watchlists/[id]`
- `/alerts`
- `/alerts/create`
- `/alerts/history`
- `/notifications`
- `/profile`

## 7.2 Protección de rutas

La decisión de navegación depende del estado de sesión gestionado por `AuthProvider`.

```text
Aplicación inicia
      │
      ▼
SessionManager.restoreSession()
      │
 ┌────┴─────┐
 │          │
 ▼          ▼
sesión     sin sesión
 │          │
 ▼          ▼
(app)      (auth)
```

No se realizarán redirecciones desde repositorios o use cases.

---

# 8. GESTIÓN DE ESTADO

## 8.1 Server State — TanStack Query

Ejemplos de query keys:

```ts
["assets"][("asset", symbol)][("asset-history", symbol, interval)][
  "watchlists"
][("watchlist", watchlistId)]["alerts"][("alert-history", filters)][
  "notifications"
];
```

## 8.2 Mutations

Ejemplo conceptual:

```text
CreateWatchlist mutation
         │
         ▼
CreateWatchlist Use Case
         │
         ▼
Repository
         │
         ▼
FastAPI
         │
         ▼
invalidate ["watchlists"]
```

## 8.3 Client State — Zustand

Stores inicialmente permitidos:

### `preferencesStore`

- theme;
- currency display preference;
- notification UI preference.

### `marketFiltersStore`

- asset type filter;
- search filter;
- preferred interval.

No se almacenarán listas de assets, alertas ni watchlists en Zustand.

## 8.4 Local State

`useState` y `useReducer` se utilizarán para estados exclusivos del componente:

- modal abierto/cerrado;
- input temporal;
- tab seleccionada local;
- confirmación de eliminación.

---

# 9. AUTENTICACIÓN

## 9.1 Flujo de login

```text
LoginScreen
    │
    ▼
useAuth
    │
    ▼
Login Use Case
    │
    ▼
AuthRepository
    │
    ▼
SupabaseAuthRepository
    │
    ▼
Supabase Auth
    │
    ▼
SessionManager
    │
    ▼
AuthProvider actualiza estado
    │
    ▼
Expo Router -> (app)
```

## 9.2 Flujo de peticiones autenticadas

```text
Repository
   │
   ▼
ApiClient
   │
   ▼
SessionManager.getAccessToken()
   │
   ▼
Authorization: Bearer <JWT>
   │
   ▼
FastAPI
```

## 9.3 Expiración de sesión

Regla:

1. Supabase administra refresh de sesión.
2. `SessionManager` devuelve el token activo.
3. Ante un `401`, el cliente intenta sincronizar/recuperar sesión una sola vez.
4. No se permiten loops infinitos de retry.
5. Si no puede recuperarse sesión:
   - limpiar estado autenticado;
   - redirigir a login;
   - mostrar mensaje de sesión expirada.

---

# 10. CLIENTE HTTP

## 10.1 Responsabilidad de `ApiClient`

```ts
interface ApiClient {
  get<T>(path: string, config?: RequestConfig): Promise<T>;
  post<TResponse, TBody>(path: string, body: TBody): Promise<TResponse>;
  put<TResponse, TBody>(path: string, body: TBody): Promise<TResponse>;
  patch<TResponse, TBody>(path: string, body: TBody): Promise<TResponse>;
  delete<T>(path: string): Promise<T>;
}
```

## 10.2 Reglas

- una única instancia de Axios;
- `baseURL` desde variables de entorno;
- timeout centralizado;
- JWT en interceptor;
- errores transformados;
- nunca imprimir JWT en logs;
- nunca guardar `service_role` en frontend;
- nunca colocar API keys privadas de backend en Expo.

---

# 11. CONTRATOS DE REPOSITORIO

## 11.1 AuthRepository

```ts
export interface AuthRepository {
  login(email: string, password: string): Promise<UserSession>;
  register(email: string, password: string): Promise<UserSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<UserSession | null>;
}
```

## 11.2 MarketRepository

```ts
export interface MarketRepository {
  getAssets(): Promise<Asset[]>;
  getAssetBySymbol(symbol: string): Promise<Asset>;
  getHistoricalPrices(
    symbol: string,
    interval: MarketInterval,
  ): Promise<AssetPrice[]>;
}
```

## 11.3 WatchlistRepository

```ts
export interface WatchlistRepository {
  getAll(): Promise<Watchlist[]>;
  getById(id: string): Promise<Watchlist>;
  create(name: string): Promise<Watchlist>;
  delete(id: string): Promise<void>;
  addAsset(watchlistId: string, assetId: string): Promise<void>;
  removeAsset(watchlistId: string, assetId: string): Promise<void>;
}
```

## 11.4 AlertRepository

```ts
export interface AlertRepository {
  getAll(): Promise<Alert[]>;
  create(input: CreateAlertInput): Promise<Alert>;
  update(id: string, input: UpdateAlertInput): Promise<Alert>;
  delete(id: string): Promise<void>;
  getHistory(filters?: AlertHistoryFilters): Promise<AlertHistoryEntry[]>;
}
```

## 11.5 NotificationRepository

```ts
export interface NotificationRepository {
  getAll(): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
}
```

---

# 12. USE CASES

Los use cases encapsulan intención de usuario y reglas de aplicación.

Ejemplo:

```ts
export class CreateWatchlist {
  constructor(private readonly repository: WatchlistRepository) {}

  async execute(name: string): Promise<Watchlist> {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new ValidationError("El nombre de la watchlist es obligatorio");
    }

    return this.repository.create(normalizedName);
  }
}
```

Regla:

> Si un comportamiento puede probarse sin React Native, preferentemente debe vivir fuera de la UI.

---

# 13. DTOs Y MAPPERS

Ejemplo API:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Tecnología",
  "created_at": "2026-09-10T20:00:00Z"
}
```

DTO:

```ts
export interface WatchlistDTO {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
```

Domain:

```ts
export interface Watchlist {
  id: string;
  name: string;
  createdAt: Date;
}
```

Mapper:

```ts
export const mapWatchlistDto = (dto: WatchlistDTO): Watchlist => ({
  id: dto.id,
  name: dto.name,
  createdAt: new Date(dto.created_at),
});
```

Presentation no recibe `user_id` si no lo necesita.

---

# 14. WEBSOCKET Y TIEMPO REAL

## 14.1 Contrato

```ts
export interface PriceStream {
  connect(symbol: string): void;
  subscribe(listener: (price: LivePrice) => void): () => void;
  disconnect(): void;
}
```

## 14.2 Implementación

`FastApiPriceStream` será la única implementación que conozca la URL WebSocket.

```text
Market Screen
      │
      ▼
usePriceStream(symbol)
      │
      ▼
PriceStream
      │
      ▼
FastApiPriceStream
      │
      ▼
FastAPI WebSocket
```

## 14.3 Reconexión

Política propuesta:

- reconexión con backoff;
- máximo de reintentos configurable;
- cancelar reconexión al desmontar pantalla;
- una conexión por stream activo;
- limpiar listeners en unsubscribe.

El WebSocket no guarda información crítica.

La API REST continúa siendo la fuente de datos persistidos.

---

# 15. GRÁFICOS

Los gráficos no conocerán directamente FastAPI.

Flujo:

```text
AssetDetailScreen
      │
      ▼
useHistoricalPrices
      │
      ▼
GetHistoricalPrices
      │
      ▼
MarketRepository
      │
      ▼
PriceChart
```

`PriceChart` recibe datos preparados:

```ts
export interface ChartPoint {
  timestamp: number;
  value: number;
}
```

La librería visual se encapsula mediante un adapter/componente.

Esto permite reemplazar la librería sin modificar la lógica de mercado.

---

# 16. FORMULARIOS Y VALIDACIÓN

## 16.1 React Hook Form

Se utilizará en:

- login;
- register;
- crear watchlist;
- crear alerta;
- editar alerta.

## 16.2 Zod

Ejemplo:

```ts
const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
```

Las validaciones puramente de interfaz pueden permanecer en Zod.

Las reglas de negocio deben estar en dominio/use cases.

---

# 17. MANEJO DE ERRORES

## 17.1 Tipos base

```ts
export type ApplicationErrorCode =
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "VALIDATION"
  | "NOT_FOUND"
  | "NETWORK"
  | "TIMEOUT"
  | "SERVER"
  | "UNKNOWN";
```

## 17.2 Flujo

```text
Axios / Supabase / WebSocket
        │
        ▼
error adapter
        │
        ▼
ApplicationError
        │
        ▼
hook/use case
        │
        ▼
Presentation
```

## 17.3 Mensajes

La UI mostrará mensajes comprensibles.

Ejemplos:

- "No se pudo conectar con el servidor."
- "Tu sesión ha expirado."
- "No tienes permisos para realizar esta acción."
- "No se encontró el recurso solicitado."

No se mostrarán stack traces ni mensajes internos de FastAPI.

---

# 18. CONFIGURACIÓN Y VARIABLES DE ENTORNO

`.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Nunca incluir:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
SUPABASE_JWT_SECRET
FINNHUB_API_KEY privada del backend
COINGECKO_API_KEY privada del backend
REDIS_URL
```

El frontend es un entorno no confiable: cualquier secreto empaquetado puede ser extraído.

---

# 19. PROVIDERS GLOBALES

`AppProviders` compondrá únicamente providers transversales:

```tsx
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
```

No convertir `AppProviders` en un contenedor de lógica de negocio.

---

# 20. COMPONENTES COMPARTIDOS

`src/shared/components` debe contener componentes realmente reutilizados.

Iniciales:

- `AppButton`
- `AppInput`
- `LoadingView`
- `ErrorView`
- `EmptyState`

No mover un componente a `shared` hasta que tenga al menos dos consumidores razonables o una responsabilidad transversal clara.

---

# 20.1 SISTEMA DE DISEÑO Y PALETA DE COLORES

La interfaz visual de **InFinance** utilizará una paleta centralizada para mantener consistencia entre pantallas, componentes compartidos, estados y elementos de navegación. Los colores no deberán declararse de forma dispersa mediante valores hexadecimales dentro de las features; se consumirán desde los _design tokens_ definidos en `src/shared/theme/colors.ts`.

## 20.1.1 Paleta principal

| Token           | Código    | Rol visual        | Uso recomendado                                                                         |
| --------------- | --------- | ----------------- | --------------------------------------------------------------------------------------- |
| `background`    | `#FFFFFF` | Fondo claro       | Fondo principal de pantallas, tarjetas claras, modales e inputs                         |
| `secondary`     | `#8F9CAE` | Secundario        | Bordes, divisores, fondos secundarios y elementos deshabilitados                        |
| `surfaceDark`   | `#1E2733` | Superficie oscura | Navegación, cabeceras, superficies destacadas y texto principal cuando corresponda      |
| `textSecondary` | `#5F6E80` | Texto secundario  | Descripciones, placeholders, texto de apoyo e iconografía secundaria                    |
| `success`       | `#00E676` | Éxito             | Estados positivos, confirmaciones, variaciones positivas y acciones asociadas a éxito   |
| `accent`        | `#00F3FF` | Acento            | Elementos interactivos destacados, selección, enlaces, indicadores y elementos gráficos |

Paleta de referencia:

```text
#FFFFFF  Fondo claro
#8F9CAE  Secundario
#1E2733  Superficie oscura
#5F6E80  Texto secundario
#00E676  Éxito
#00F3FF  Acento
```

## 20.1.2 Implementación como design tokens

La primera implementación será deliberadamente simple y podrá evolucionar a un sistema de tema más amplio si el proyecto lo requiere.

```ts
// src/shared/theme/colors.ts
export const colors = {
  background: "#FFFFFF",
  secondary: "#8F9CAE",
  surfaceDark: "#1E2733",
  textSecondary: "#5F6E80",
  success: "#00E676",
  accent: "#00F3FF",
} as const;

export type ColorToken = keyof typeof colors;
```

Los componentes deberán importar los tokens en lugar de repetir códigos hexadecimales:

```ts
import { colors } from "@/shared/theme/colors";
```

## 20.1.3 Reglas de uso

1. Los colores globales se definen únicamente en `shared/theme`.
2. Las pantallas y features no deben duplicar valores hexadecimales de la paleta.
3. `#FFFFFF` se utilizará como base de las superficies claras.
4. `#1E2733` será la referencia para superficies oscuras y elementos de alta jerarquía visual.
5. `#5F6E80` se reservará para contenido secundario; no sustituirá al color de texto principal cuando el contraste sea insuficiente.
6. `#00E676` representa estados positivos o de éxito. No se utilizará como único mecanismo para comunicar un estado.
7. `#00F3FF` funcionará como acento visual e indicador de interacción o selección.
8. `#8F9CAE` se utilizará para elementos secundarios, bordes, divisores y estados de menor jerarquía.
9. Cualquier color adicional necesario para error, advertencia o información deberá añadirse posteriormente como un nuevo token documentado, evitando valores arbitrarios dentro de componentes.

## 20.1.4 Accesibilidad y contraste

La paleta define la identidad visual, pero no implica que cualquier combinación entre sus colores sea válida para texto. Durante la implementación se verificará el contraste de cada combinación utilizada en botones, textos, fondos y estados interactivos.

Reglas mínimas:

- no comunicar ganancias, pérdidas, errores o estados únicamente mediante color;
- acompañar estados relevantes con texto, iconografía o indicadores adicionales;
- comprobar legibilidad del texto secundario sobre fondos claros;
- evitar texto pequeño en colores de acento si la combinación no ofrece contraste suficiente;
- mantener áreas táctiles y estados de foco/selección claramente distinguibles;
- incorporar futuros tokens de error y advertencia cuando dichas interfaces sean implementadas.

## 20.1.5 Relación con la arquitectura

El sistema de diseño pertenece a `shared` porque es transversal a todas las features:

```text
src/shared/theme
      │
      ├── colors.ts
      └── index.ts
           │
           ▼
shared/components
           │
           ▼
auth / market / watchlists / alerts / charts / notifications / profile
```

Los componentes compartidos (`AppButton`, `AppInput`, `LoadingView`, `ErrorView`, `EmptyState`) serán los primeros consumidores de estos tokens. De esta forma, un cambio futuro de identidad visual podrá realizarse desde una fuente central sin modificar cada pantalla individualmente.

## 20.1.6 TDD y sistema visual

TDD no se utilizará para comprobar valores de estilo triviales como el hexadecimal exacto de un fondo. Los tests de componentes verificarán comportamiento observable: estados habilitado/deshabilitado, mensajes, interacción, accesibilidad y variantes semánticas cuando corresponda.

Por ejemplo, `AppButton` podrá exponer variantes como `primary`, `accent` o `disabled`, mientras que la correspondencia de cada variante con los tokens permanecerá encapsulada en el componente compartido.

---

# 21. DISEÑO DE PANTALLAS PREVISTO

## H1 — Auth

### LoginScreen

- correo;
- contraseña;
- botón iniciar sesión;
- enlace registro;
- loading;
- error.

### RegisterScreen

- correo;
- contraseña;
- confirmación;
- botón registro;
- validaciones.

## H2 — Mercado

### MarketScreen

- búsqueda;
- filtros;
- lista de activos;
- precio;
- variación;
- estado de carga/error.

### AssetDetailScreen

- nombre;
- símbolo;
- precio actual;
- variación;
- gráfico;
- selector de intervalo;
- añadir a watchlist;
- crear alerta.

## H3 — Watchlists

### WatchlistsScreen

- listado;
- crear;
- eliminar;
- navegación a detalle.

### WatchlistDetailScreen

- activos;
- añadir activo;
- remover activo;
- acceso al detalle de activo.

## H4 — Alertas

### AlertsScreen

- alertas activas;
- estado;
- editar;
- eliminar;
- crear.

### CreateAlertScreen

- activo;
- tipo;
- condición;
- valor objetivo;
- validación.

## H5 — Charts

Integrado en `AssetDetailScreen`.

Incluye:

- intervalos;
- loading;
- estado vacío;
- actualización en tiempo real cuando corresponda.

## H6 — Notifications

### NotificationsScreen

- lista;
- leída/no leída;
- activo;
- mensaje;
- fecha;
- marcar como leída.

## H7 — Alert History

### AlertHistoryScreen

- orden descendente;
- filtro por activo;
- filtro por fecha;
- precio disparado;
- condición;
- fecha/hora.

---

# 22. ESTRATEGIA DE TESTING

## 22.1 Filosofía

TDD se emplea como herramienta de diseño.

No se busca probar detalles internos de React.

Se probará comportamiento observable.

## 22.2 Pirámide

```text
           /\
          /  \
         / E2E\
        /______\
       /        \
      /Integration\
     /____________\
    /              \
   /      Unit      \
  /__________________\
```

---

# 23. TDD POR CAPA

## 23.1 Domain / Use Cases — TDD estricto

Ciclo obligatorio:

```text
RED
 ↓
GREEN
 ↓
REFACTOR
```

### Ejemplo: CreateWatchlist

#### RED

```ts
it("rejects an empty watchlist name", async () => {
  const repository = createWatchlistRepositoryMock();
  const useCase = new CreateWatchlist(repository);

  await expect(useCase.execute("   ")).rejects.toThrow(
    "El nombre de la watchlist es obligatorio",
  );
});
```

#### GREEN

Implementar únicamente lo necesario.

#### REFACTOR

Mejorar diseño sin romper tests.

## 23.2 Hooks

Se aplica TDD cuando un hook contiene lógica relevante.

Ejemplos:

- `useAuth`;
- `usePriceStream`;
- composición de mutations;
- filtros complejos.

No escribir test unitario para hooks que solo reexportan `useQuery` sin lógica adicional.

## 23.3 Components

React Native Testing Library.

Probar:

- lo que el usuario ve;
- lo que el usuario toca;
- navegación resultante;
- mensajes de error;
- estados loading/empty.

Evitar:

- comprobar estado interno;
- probar nombres de funciones privadas;
- snapshots masivos sin valor.

## 23.4 Data / Infrastructure

Pruebas de integración o adapters.

Casos:

- mapeo DTO -> Domain;
- errores HTTP -> ApplicationError;
- JWT incluido;
- 401;
- timeout;
- websocket connect/disconnect;
- reconexión.

---

# 24. POLÍTICA DE COVERAGE

| Área                       | Objetivo |
| -------------------------- | -------: |
| Domain entities con lógica |     100% |
| Use Cases                  |   >= 90% |
| Mappers con lógica         |   >= 90% |
| Hooks con lógica           |   >= 80% |
| Repositories               |   >= 70% |
| Infrastructure crítica     |   >= 70% |
| Components principales     |   >= 70% |
| Global                     |   >= 75% |

Coverage es una métrica de apoyo, no el objetivo principal.

---

# 25. ESTRUCTURA DE TESTS

```text
tests/
├── setup/
│   ├── jest.setup.ts
│   └── testUtils.tsx
├── unit/
│   ├── auth/
│   │   └── Login.test.ts
│   ├── watchlists/
│   │   └── CreateWatchlist.test.ts
│   ├── alerts/
│   │   └── CreateAlert.test.ts
│   └── market/
│       └── MarketMapper.test.ts
├── integration/
│   ├── auth/
│   │   └── LoginScreen.test.tsx
│   ├── watchlists/
│   │   └── WatchlistsScreen.test.tsx
│   ├── alerts/
│   │   └── AlertsScreen.test.tsx
│   └── infrastructure/
│       ├── ApiClient.test.ts
│       └── PriceStream.test.ts
└── e2e/
    ├── auth-flow.yaml
    ├── watchlist-flow.yaml
    └── alert-flow.yaml
```

---

# 26. JOURNEYS E2E CRÍTICOS

## Journey 1 — Autenticación

```text
Abrir app
  ↓
Login
  ↓
Credenciales válidas
  ↓
Home
```

## Journey 2 — Watchlist

```text
Login
  ↓
Crear watchlist
  ↓
Buscar activo
  ↓
Añadir activo
  ↓
Verificar activo en lista
```

## Journey 3 — Alerta

```text
Login
  ↓
Seleccionar activo
  ↓
Crear alerta
  ↓
Ver alerta en listado
```

No es necesario automatizar cada pantalla mediante E2E.

---

# 27. ROADMAP DE CONSTRUCCIÓN FRONTEND

Este roadmap se alinea conceptualmente con las historias de usuario y con el desarrollo del backend.

### Reglas transversales para todas las fases

- [x] todo texto visible y mensaje de error se obtiene desde `shared/constants/strings.ts`;
- [x] todo color se obtiene desde los tokens de `shared/theme/`;
- [x] el cambio claro/oscuro se propaga globalmente mediante `AppThemeProvider`;
- [x] ninguna pantalla mantiene una configuración de tema independiente.

## Fase F0 — Setup y arquitectura base

**Objetivo:** dejar la aplicación preparada para construir funcionalidades con TDD.

Entregables:

- [x] Expo + TypeScript;
- [x] Expo Router;
- [x] aliases;
- [x] ESLint;
- [x] Prettier;
- [x] Jest;
- [x] React Native Testing Library;
- [x] TanStack Query;
- [x] Zustand;
- [x] estructura `src/`;
- [x] sistema de diseño base y `shared/theme/colors.ts`;
- [x] paleta de colores oficial de InFinance;
- [x] `AppProviders`;
- [x] `.env`;
- [x] primer test funcionando.

Criterio de aceptación:

```text
npm test
```

ejecuta correctamente al menos un test.

## Fase F1 — H1 Autenticación

Construir:

- [x] `AuthRepository`;
- [x] `SupabaseAuthRepository`;
- [x] `SessionManager`;
- [x] `Login`;
- [x] `Register`;
- [x] `Logout`;
- [x] `AuthProvider`;
- [x] LoginScreen;
- [x] RegisterScreen;
- [x] protección `(auth)` / `(app)`.

TDD:

- [x] email/password inválidos;
- [x] login exitoso;
- [x] error de Supabase;
- [x] sesión restaurada;
- [x] logout.

## Fase F2 — Infraestructura HTTP

Construir:

- [x] `ApiClient`;
- [x] interceptores;
- [x] token;
- [x] errores;
- [x] timeout;
- [x] configuración.

Tests:

- [x] Authorization header;
- [x] error 401;
- [x] timeout;
- [x] transformación de errores;
- [x] no loop de refresh.

## Fase F3 — H2 Market

Construir:

- [x] Asset;
- [x] AssetPrice;
- [x] MarketRepository;
- [x] ApiMarketRepository;
- [x] queries;
- [x] MarketScreen;
- [x] AssetDetailScreen.

TDD:

- [x] mapper;
- [x] use cases;
- [x] filtros;
- [x] manejo de empty/error.

## Fase F4 — H3 Watchlists

Construir:

- [x] Watchlist;
- [x] WatchlistRepository;
- [x] use cases;
- [x] ApiWatchlistRepository;
- [x] hooks;
- [x] WatchlistsScreen;
- [x] WatchlistDetailScreen.

TDD:

- [x] nombre vacío;
- [x] crear;
- [x] eliminar;
- [x] añadir activo;
- [x] remover activo;
- [x] invalidación de cache.

## Fase F5 — H5 Charts

Construir:

- [x] ChartPoint;
- [x] transformación;
- [x] adaptador;
- [x] PriceChart;
- [x] selector de intervalo;
- [x] histórico.

Tests:

- [x] mapping;
- [x] intervalos;
- [x] empty/loading;
- [x] renderizado del contenedor.

## Fase F6 — H4 Alerts

Construir:

- [x] Alert;
- [x] AlertRepository;
- [x] CreateAlert;
- [x] UpdateAlert;
- [x] DeleteAlert;
- [x] ApiAlertRepository;
- [x] AlertsScreen;
- [x] CreateAlertScreen.

TDD:

- [x] target inválido;
- [x] condición requerida;
- [x] creación;
- [x] edición;
- [x] eliminación.

## Fase F7 — WebSocket

Construir:

- [x] `PriceStream`;
- [x] `FastApiPriceStream`;
- [x] `ReconnectionPolicy`;
- [x] `usePriceStream`.

Tests:

- [x] connect;
- [x] message;
- [x] unsubscribe;
- [x] disconnect;
- [x] retry;
- [x] desmontaje sin memory leak.

## Fase F8 — H6 Notifications + H7 History

Construir:

- [x] Notification;
- [x] NotificationRepository;
- [x] GetNotifications;
- [x] MarkNotificationAsRead;
- [x] NotificationsScreen;
- [x] AlertHistoryScreen;
- [x] filtros.

Tests:

- [x] orden;
- [x] filtro;
- [x] marcar leída;
- [x] empty/error.

## Fase F9 — Integración

Validar:

- [x] auth -> API;
- [x] JWT;
- [x] market;
- [x] watchlists;
- [x] alerts;
- [x] WS;
- [x] notifications;
- [x] navegación completa.

## Fase F10 — E2E + Coverage

Ejecutar:

- journeys críticos;
- coverage;
- regresión;
- corrección de tests flaky.

Objetivos:

- > =75% global;
- > =90% use cases.

## Fase F11 — Pulido y validación con usuarios

Revisar:

- loading;
- empty states;
- errores;
- accesibilidad básica;
- consistencia visual con la paleta oficial;
- contraste de colores;
- textos;
- navegación;
- responsive layouts;
- Android;
- iOS cuando sea posible;
- feedback de usuarios.

---

# 28. ORDEN RECOMENDADO DE CONSTRUCCIÓN DE PANTALLAS

La construcción visual no debe realizarse toda al inicio.

Orden:

1. Design primitives compartidos y tokens de la paleta oficial.
2. Login.
3. Register.
4. Market.
5. Asset Detail.
6. Watchlists.
7. Watchlist Detail.
8. Charts.
9. Alerts.
10. Create/Edit Alert.
11. Notifications.
12. Alert History.
13. Profile.
14. Estados globales de error/empty/loading.
15. Pulido.

Cada pantalla se construye junto con su vertical slice.

---

# 29. VERTICAL SLICE RECOMENDADO

Ejemplo Watchlist:

```text
Test Use Case
   ↓
Domain
   ↓
Repository Contract
   ↓
Repository Implementation
   ↓
FastAPI integration
   ↓
TanStack Query hook
   ↓
Screen
   ↓
Component tests
   ↓
Integration tests
```

Evitar:

```text
crear todas las entities
↓
crear todos los repositories
↓
crear todos los hooks
↓
crear todas las screens
```

El desarrollo vertical produce software usable al final de cada feature.

---

# 30. CONVENCIONES DE CÓDIGO

## 30.1 Nombres

React components:

```text
PascalCase
```

Funciones:

```text
camelCase
```

Hooks:

```text
useSomething
```

Use cases:

```text
CreateWatchlist
GetAlerts
Login
```

Interfaces repository:

```text
WatchlistRepository
AlertRepository
```

Implementaciones:

```text
ApiWatchlistRepository
SupabaseAuthRepository
```

---

# 31. IMPORTACIONES

Se recomienda alias:

```text
@/features
@/shared
@/infrastructure
@/providers
@/store
```

Evitar:

```ts
../../../../../../shared/components/AppButton
```

---

# 32. SEGURIDAD FRONTEND

Reglas obligatorias:

1. Nunca almacenar `service_role`.
2. Nunca incluir secretos de backend.
3. No imprimir JWT.
4. No confiar en validaciones del cliente como medida de seguridad.
5. FastAPI vuelve a validar todas las operaciones.
6. SecureStore se utiliza para información sensible cuando proceda.
7. Datos de otros usuarios nunca se filtran únicamente desde frontend.
8. Logout limpia cache de TanStack Query relacionada con el usuario.

---

# 33. PERFORMANCE

Prácticas:

- FlatList para listados;
- evitar renders innecesarios;
- query cache;
- paginación si el volumen lo requiere;
- memoización solo cuando exista medición o necesidad;
- cancelar requests obsoletas;
- limpiar subscriptions WebSocket;
- evitar guardar grandes datasets en Zustand.

No realizar optimizaciones prematuras.

---

# 34. OBSERVABILIDAD

En desarrollo se podrán registrar:

- ruta solicitada;
- status;
- tiempo;
- tipo de error;
- eventos WebSocket.

Nunca registrar:

- password;
- JWT completo;
- claves;
- datos sensibles.

En producción/demo, logging reducido.

---

# 35. ACCESIBILIDAD BÁSICA

Pantallas principales deberán incluir:

- `accessibilityLabel` cuando el control no sea autoexplicativo;
- botones con áreas táctiles adecuadas;
- mensajes de error visibles;
- texto no dependiente únicamente de color;
- labels asociados a inputs.

---

# 36. ANTI-PATRONES A EVITAR

| Anti-patrón                         | Problema                             | Solución                               |
| ----------------------------------- | ------------------------------------ | -------------------------------------- |
| Pantalla llama Axios directamente   | Acoplamiento                         | Repository + ApiClient                 |
| Pantalla llama Supabase DB          | Rompe backend como fuente de negocio | FastAPI                                |
| Todo en Zustand                     | Duplica server state                 | TanStack Query                         |
| Un único `services/` gigante        | Baja cohesión                        | Features                               |
| `utils.ts` con cientos de funciones | God file                             | Utilidades enfocadas                   |
| DTO usado como entidad              | Acopla backend a UI                  | Mapper cuando exista diferencia        |
| TDD para estilos triviales          | Bajo retorno                         | Test comportamiento                    |
| Snapshot de toda la app             | Tests frágiles                       | Assertions semánticas                  |
| WebSocket en screen                 | Difícil de limpiar/testear           | PriceStream                            |
| Retry infinito 401                  | Loops y errores de auth              | Máximo un intento controlado           |
| Duplicar lógica frontend/backend    | Inconsistencia                       | Backend autoridad para reglas críticas |
| Crear interfaces para todo          | Sobreingeniería                      | Abstraer donde aporta desacoplamiento  |

---

# 37. DEFINITION OF DONE POR FEATURE

Una feature se considera terminada cuando:

- [ ] cumple criterios de aceptación;
- [ ] lógica de dominio/use case tiene tests;
- [ ] tests pasan;
- [ ] no existen errores TypeScript;
- [ ] lint pasa;
- [ ] estados loading/error/empty están contemplados;
- [ ] navegación funciona;
- [ ] integración con backend funciona;
- [ ] no contiene secretos;
- [ ] coverage objetivo de la feature es razonable;
- [ ] README/arquitectura se actualiza si hubo decisión relevante.

---

# 38. COMANDOS DE CALIDAD

El proyecto deberá exponer scripts equivalentes a:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

Antes de integrar una feature:

```bash
npm run typecheck
npm run lint
npm test
```

---

# 39. ESTRATEGIA DE COMMITS CON TDD

Ejemplo:

```text
test(watchlists): add failing validation test
feat(watchlists): validate watchlist name
refactor(watchlists): simplify creation flow
test(watchlists): add repository integration test
feat(watchlists): connect create flow to API
feat(watchlists): add creation screen
```

El historial de commits podrá demostrar ciclos Red-Green-Refactor para el TFM.

---

# 40. RELACIÓN FRONTEND ↔ BACKEND

```text
FRONTEND                           BACKEND

Presentation
    │
    ▼
Use Case                          API Route
    │                                 │
    ▼                                 ▼
Repository Port                  Use Case
    │                                 │
    ▼                                 ▼
Repository Impl                  Repository Port
    │                                 │
    ▼                                 ▼
ApiClient                        SQLAlchemy Repository
    │                                 │
    └──────── HTTP/JSON ──────────────┘
                                      │
                                      ▼
                                  PostgreSQL
```

Para autenticación:

```text
React Native
     │
     ▼
Supabase Auth
     │
     ▼
JWT
     │
     ▼
ApiClient
     │
     ▼
FastAPI
```

---

# 41. CRITERIOS DE ÉXITO DEL FRONTEND

1. **Arquitectura demostrable:** una funcionalidad puede seguirse desde pantalla hasta repository sin lógica HTTP embebida en Presentation.
2. **Modularidad:** cada feature tiene límites claros.
3. **Seguridad:** ningún secreto backend existe en la app.
4. **Sesión robusta:** autenticación, expiración y logout funcionan correctamente.
5. **Server state coherente:** TanStack Query es la fuente de estado remoto.
6. **Tiempo real estable:** conexiones WebSocket se limpian y reconectan correctamente.
7. **Testeabilidad:** use cases pueden probarse sin montar React Native.
8. **TDD demostrable:** commits muestran Red-Green-Refactor en lógica relevante.
9. **Coverage:** objetivo global >=75%.
10. **UX funcional:** loading/error/empty states existen en flujos principales.
11. **Trazabilidad:** H1-H7 pueden asociarse a features y tests concretos.
12. **Integración:** frontend consume únicamente contratos públicos de FastAPI y Supabase Auth.

---

# 42. DECISIÓN FINAL

La arquitectura definitiva del frontend de InFinance será:

> **React Native + Expo + TypeScript con Arquitectura Modular Orientada a Funcionalidades (Feature-Based Architecture), aplicando principios de Clean Architecture, Dependency Inversion y TDD.**

La administración de estado se divide entre:

> **TanStack Query para Server State, Zustand para Client State y estado local de React para interacción exclusiva de componentes.**

Supabase será consumido directamente por el frontend únicamente para autenticación.

Las operaciones de negocio utilizarán FastAPI.

El streaming de precios se realizará mediante WebSocket encapsulado como infraestructura.

La estrategia de desarrollo será **vertical slice + TDD**, construyendo cada feature de extremo a extremo antes de avanzar a la siguiente.

---

# 43. PRIMERA FASE DE IMPLEMENTACIÓN

El primer bloque a implementar será **F0 — Setup y Arquitectura Base**.

Debe dejar preparado:

- Expo;
- TypeScript;
- Expo Router;
- estructura modular;
- aliases;
- TanStack Query;
- Zustand;
- Jest;
- React Native Testing Library;
- ESLint;
- Prettier;
- variables de entorno;
- providers;
- test inicial.

Después se continuará con **F1 — H1 Autenticación**.

No se desarrollarán pantallas de negocio antes de completar F0.

---

# 44. CHECKLIST DE ARRANQUE

## Repositorio

- [ ] Crear/validar repositorio frontend.
- [ ] Configurar `.gitignore`.
- [ ] Crear `.env`.
- [ ] Documentar requisitos del entorno.

## Base Expo

- [ ] Inicializar proyecto TypeScript.
- [ ] Verificar Android.
- [ ] Verificar Expo Router.

## Arquitectura

- [ ] Crear `src/features`.
- [ ] Crear `src/infrastructure`.
- [ ] Crear `src/shared`.
- [ ] Crear `src/shared/theme/colors.ts` con la paleta oficial.
- [ ] Crear `src/providers`.
- [ ] Crear `src/store`.
- [ ] Configurar alias `@`.

## Testing

- [ ] Jest.
- [ ] React Native Testing Library.
- [ ] `jest.setup.ts`.
- [ ] `testUtils.tsx`.
- [ ] Primer test en verde.
- [ ] Coverage.

## Calidad

- [ ] ESLint.
- [ ] Prettier.
- [ ] Typecheck.
- [ ] Scripts npm.

## Infraestructura base

- [ ] QueryClient.
- [ ] AppProviders.
- [ ] variables de entorno tipadas.
- [ ] ApiClient base.
- [ ] ApplicationError base.
- [ ] Design tokens de colores centralizados.

---

# 45. REGLA DE IMPLEMENTACIÓN PARA CODEX / AGENTES

Cuando este plan sea ejecutado con asistencia de agentes o Codex:

1. trabajar una fase a la vez;
2. leer este documento y el plan backend antes de modificar contratos compartidos;
3. escribir primero el test cuando aplique TDD;
4. ejecutar el test y confirmar RED;
5. implementar lo mínimo;
6. ejecutar y confirmar GREEN;
7. refactorizar;
8. ejecutar suite relacionada;
9. ejecutar typecheck;
10. ejecutar lint;
11. revisar diff;
12. commit pequeño;
13. no avanzar a la siguiente feature con tests rotos.

---

# 46. ORDEN DE IMPLEMENTACIÓN RESUMIDO

```text
F0  Setup + Architecture + Testing
 ↓
F1  Auth
 ↓
F2  HTTP Infrastructure
 ↓
F3  Market
 ↓
F4  Watchlists
 ↓
F5  Charts
 ↓
F6  Alerts
 ↓
F7  WebSocket
 ↓
F8  Notifications + History
 ↓
F9  Integration
 ↓
F10 E2E + Coverage
 ↓
F11 User validation + polish
```

---

# 47. CONCLUSIÓN

La arquitectura propuesta permite que InFinance mantenga una estructura clara tanto en backend como en frontend sin forzar que ambos proyectos utilicen exactamente el mismo patrón.

El backend concentra la lógica de negocio, persistencia, integración con fuentes financieras y evaluación de alertas. El frontend concentra presentación, interacción, estado de interfaz y coordinación de casos de uso móviles, manteniendo los detalles de infraestructura aislados.

La organización modular por features favorece la evolución independiente de las funcionalidades, mientras que los principios de Clean Architecture aseguran que la lógica relevante pueda probarse de manera aislada.

La aplicación de TDD desde el inicio busca utilizar los tests como una herramienta de diseño y no únicamente como una validación al final del desarrollo.

Este documento será la referencia técnica principal para la construcción del frontend móvil de InFinance.

---

_Documento de arquitectura frontend — InFinance_  
_React Native | Expo | TypeScript | Feature-Based Architecture | Clean Architecture | TDD_
