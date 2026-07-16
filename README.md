# Cinebook — Cinema Library

Catálogo personal de **libros de cine**: inventario, anti-duplicados, lista de deseados y estadísticas.  
Marca: **Cinebook** · subtexto **Cinema Library**.

Repositorio: [github.com/Sarajesko/Cinebook](https://github.com/Sarajesko/Cinebook)

---

## Qué hay hoy

| Área | Estado |
|------|--------|
| API NestJS (auth, libros, wishlist, stats, anti-duplicado) | Listo |
| Front Angular (login, shell, catálogo listado + ficha) | Listo |
| Formularios alta/edición, filtros, escaneo ISBN, UI wishlist/stats | Pendiente (checklist local) |
| Docker / Postgres | Más adelante |

### Dominio (libro)

Campos clave: título, autores, año, editorial, lengua (bandera ES / USA / FR / PT), país de edición, ISBN, estado de lectura, fecha de compra («hace X»), condición (**nuevo** / **segunda mano**), precio, puntuación **1–10**, carátula, figuras del cine (directores, guionistas, actores, productores).

---

## Estructura

```
frontend/     Angular 19 (View)
backend/      NestJS 11 + Prisma (Controller / Model)
```

Documentación de producto (`contexto.md`, `ideas.md`, `checklist.md`) se queda **solo en local** (no va a GitHub).

---

## Requisitos

- Node.js **22+**
- npm **11+**

---

## Arranque en local

### 1. API (NestJS)

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

- API: [http://localhost:3000/api](http://localhost:3000/api)
- Health: `GET /api` → `Cinebook API — Cinema Library`
- SQLite local: `DATABASE_URL="file:./dev.db"` (ver `.env.example`)

Scripts útiles:

```bash
npm test                          # unitarios
npx jest --config ./test/jest-e2e.json --runInBand   # e2e
```

### 2. Front (Angular)

En otra terminal:

```bash
cd frontend
npm install
npm start
```

- App: [http://localhost:4200](http://localhost:4200)
- Tests: `npm run test:ci` (Chrome headless)

Asegúrate de que el API esté en marcha: el front llama a `http://localhost:3000/api` ([`frontend/src/environments/environment.ts`](frontend/src/environments/environment.ts)).

---

## Rutas del front

| Ruta | Descripción |
|------|-------------|
| `/login` · `/registro` | Auth (guest) |
| `/catalogo` | Grid de la colección |
| `/catalogo/:id` | Ficha del libro |
| `/catalogo/nuevo` · `/catalogo/:id/editar` | Stub → formularios en el siguiente paso |
| `/deseados` · `/estadisticas` | Placeholders de UI |

Nav autenticada: **Catálogo** · **Deseados** · **Estadísticas** · Salir.

---

## API REST (resumen)

Todas las rutas bajo prefijo `/api`. Auth: header `Authorization: Bearer <token>`.

### Auth

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/auth/register` | no — `{ "handle", "password" }` |
| POST | `/auth/login` | no — `{ "handle", "password" }` |
| GET | `/auth/me` | sí |

### Libros

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/books` | sí |
| POST | `/books` | sí |
| POST | `/books/check-duplicate` | sí — aviso no bloqueante |
| GET | `/books/:id` | sí |
| PATCH | `/books/:id` | sí |
| DELETE | `/books/:id` | sí |

Alta de libro (campos obligatorios): `titulo`, `autores`, `anio`, `editorial`, `lengua` (`es`\|`en`\|`fr`\|`pt`), `paisEdicion`, `isbn`, `estado`, `fechaCompra`, `condicion` (`nuevo`\|`segunda_mano`), `precio`, `puntuacion` (1–10). Opcionales: `caratula`, `notas`, `directores[]`, `guionistas[]`, `actores[]`, `productores[]`, `moneda` (default `EUR`).

La respuesta incluye `bandera` (ES / USA / FR / PT) y `haceCuanto`. Tras crear, puede venir `wishMatch` si el ISBN/título estaba en deseados.

### Wishlist

| Método | Ruta | Auth |
|--------|------|------|
| GET/POST | `/wishes` | sí |
| GET/PATCH/DELETE | `/wishes/:id` | sí |
| POST | `/wishes/:id/to-collection` | sí — deseado → libro (`recien_comprado`) |

### Estadísticas

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/stats` | sí — lengua, país, década, editorial, estado, condición, gasto, puntuaciones, crecimiento, figuras, wishlist abiertos |

---

## Stack

| Capa | Tecnología |
|------|------------|
| View | Angular 19 + SCSS |
| Controller | NestJS + JWT (Passport) + ValidationPipe |
| Model | Prisma 7 + SQLite (adapter `better-sqlite3`); PostgreSQL / Docker más adelante |

Arquitectura: **MVC** (Model Prisma · Controller Nest · View Angular).

---

## Ejemplo rápido (API)

```bash
# Registro
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"handle\":\"cinefilo\",\"password\":\"secreto1\"}"

# Login → guardar accessToken
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"handle\":\"cinefilo\",\"password\":\"secreto1\"}"

# Listar libros
curl -s http://localhost:3000/api/books -H "Authorization: Bearer TOKEN"
```

---

## Licencia

Proyecto personal / UNLICENSED por ahora.
