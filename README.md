# Cinebook — Cinema Library

Catálogo personal de **libros de cine**: inventario claro, anti-duplicados, lista de deseados y estadísticas.  
Marca: **Cinebook** · subtexto **Cinema Library**.

Repositorio: [github.com/Sarajesko/Cinebook](https://github.com/Sarajesko/Cinebook)

---

## ¿Para qué sirve?

Evitar comprar el mismo libro dos veces y tener a mano, en una sola app:

- qué ediciones tienes (lengua, país, ISBN, nuevo / segunda mano, precio, puntuación);
- qué títulos estás buscando (wishlist);
- cómo está compuesta tu colección (estadísticas).

La interfaz sigue la metáfora de una **sala de lectura de cine** (atmósfera editorial), no de una estantería genérica de DVDs.

---

## Qué incluye la v1

| Área | Estado |
|------|--------|
| API NestJS (auth JWT, libros, wishlist, stats, anti-duplicado) | Listo |
| Front Angular: login, catálogo, ficha, alta / edición | Listo |
| Filtros y búsqueda en catálogo | Listo |
| Escaneo ISBN por cámara (con fallback manual) | Listo |
| Wishlist UI + «Ya lo tengo» → colección | Listo |
| Estadísticas «La sala en números» | Listo |
| Docker / Postgres | Más adelante |

### Modelo de libro

**Obligatorios:** título, autores, año, editorial, lengua (bandera **ES / USA / FR / PT**), país de edición, **ISBN**, estado de lectura, fecha de compra (se muestra como «hace X»), condición (**nuevo** / **segunda mano**), **precio**, **puntuación 1–10**.

**Opcionales:** carátula (URL), notas, dónde comprado, figuras del cine (directores, guionistas, actores, productores).

### Modelo de deseado (wishlist)

Campos ligeros: título (obligatorio), autores, ISBN, lengua, país, notas, prioridad (`alta` / `media` / `baja`).

---

## Estructura del monorepo

```
Cinebook/
├── frontend/          Angular 19 — View (UI)
├── backend/           NestJS 11 + Prisma — Controller / Model
├── README.md
└── .gitignore
```

| Carpeta | Rol MVC | Stack |
|---------|---------|--------|
| `frontend/` | View | Angular 19, SCSS, Fraunces + Source Serif 4 |
| `backend/` | Controller + Model | NestJS, Passport JWT, Prisma 7, SQLite |

---

## Requisitos

- **Node.js** 22+
- **npm** 11+
- Navegador moderno (Chrome / Edge / Firefox / Safari)
- Cámara del dispositivo (opcional) para escanear ISBN; si no hay permiso o falla, se escribe a mano

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

| Recurso | URL / valor |
|---------|-------------|
| API base | [http://localhost:3000/api](http://localhost:3000/api) |
| Health | `GET /api` → `Cinebook API — Cinema Library` |
| Base de datos | SQLite vía `DATABASE_URL` en `.env` (por defecto `file:./dev.db`) |

Variables típicas en `backend/.env` (ver `.env.example`):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="cambia-esto-en-local"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 2. Front (Angular)

En otra terminal:

```bash
cd frontend
npm install
npm start
```

| Recurso | URL |
|---------|-----|
| App | [http://localhost:4200](http://localhost:4200) |
| API consumida | `http://localhost:3000/api` ([`frontend/src/environments/environment.ts`](frontend/src/environments/environment.ts)) |

La API debe estar en marcha antes de usar el front autenticado.

---

## Uso de la aplicación

1. **Registro / login** — `/registro` o `/login` (handle + contraseña).
2. **Catálogo** — `/catalogo`: grid de carátulas con bandera de lengua, condición, precio y estrellas.
3. **Búsqueda y filtros** — texto libre (título, autor, ISBN, figuras) + filtros por lengua, país, estado, condición, puntuación, año, autor, editorial, director, guionista, actor, productor. Los filtros se sincronizan en la URL.
4. **Alta / edición** — `/catalogo/nuevo` o `/catalogo/:id/editar`. Campos con `*` obligatorios. Botón **Escanear ISBN** abre la cámara; tras leer el código se rellena el ISBN y se lanza el chequeo anti-duplicado.
5. **Anti-duplicado** — aviso no bloqueante («¿Ya tienes este?») por ISBN o por título + autor + editorial. Puedes guardar igualmente.
6. **Deseados** — `/deseados`: lo que buscas (lista tipo notebook, distinta del catálogo). **Ya lo tengo** completa la ficha del ejemplar, lo mete en colección como `recien_comprado` y cierra el deseo.
7. **Estadísticas** — `/estadisticas`: «La sala en números» (lenguas con banderas, país, década, editorial, estado, condición, gasto, puntuaciones, crecimiento mensual, figuras, wishlist abiertos).

---

## Rutas del front

| Ruta | Descripción | Guard |
|------|-------------|--------|
| `/login` · `/registro` | Auth | guest |
| `/catalogo` | Grid + filtros / búsqueda | auth |
| `/catalogo/nuevo` · `/catalogo/:id/editar` | Alta / edición (+ escaneo ISBN) | auth |
| `/catalogo/:id` | Ficha del libro | auth |
| `/deseados` | Lista de deseados | auth |
| `/deseados/nuevo` · `/deseados/:id/editar` | Alta / edición de deseado | auth |
| `/deseados/:id/conseguir` | Ya lo tengo → colección | auth |
| `/estadisticas` | La sala en números | auth |

Nav autenticada: **Catálogo** · **Deseados** · **Estadísticas** · Salir.

---

## API REST

Prefijo global: `/api`.  
Auth: header `Authorization: Bearer <accessToken>`.

### Auth

| Método | Ruta | Auth | Body / notas |
|--------|------|------|----------------|
| POST | `/auth/register` | no | `{ "handle", "password" }` |
| POST | `/auth/login` | no | `{ "handle", "password" }` → `{ accessToken, … }` |
| GET | `/auth/me` | sí | Usuario actual |

### Libros

| Método | Ruta | Auth | Notas |
|--------|------|------|--------|
| GET | `/books` | sí | Listado del usuario |
| POST | `/books` | sí | Alta; puede devolver `wishMatch` |
| POST | `/books/check-duplicate` | sí | Aviso no bloqueante |
| GET | `/books/:id` | sí | Ficha |
| PATCH | `/books/:id` | sí | Edición parcial |
| DELETE | `/books/:id` | sí | Borrado |

**Alta — obligatorios:** `titulo`, `autores`, `anio`, `editorial`, `lengua` (`es` \| `en` \| `fr` \| `pt`), `paisEdicion`, `isbn`, `estado` (`por_leer` \| `leyendo` \| `leido` \| `recien_comprado`), `fechaCompra` (ISO date), `condicion` (`nuevo` \| `segunda_mano`), `precio`, `puntuacion` (1–10).

**Opcionales:** `caratula`, `notas`, `dondeComprado`, `directores[]`, `guionistas[]`, `actores[]`, `productores[]`, `moneda` (default `EUR`).

La respuesta añade `bandera` (`ES` / `USA` / `FR` / `PT`) y `haceCuanto`. Un ISBN duplicado en colección responde **409** en el alta; el aviso previo va por `check-duplicate`.

### Wishlist

| Método | Ruta | Auth | Notas |
|--------|------|------|--------|
| GET | `/wishes` | sí | Listado |
| POST | `/wishes` | sí | Alta |
| GET / PATCH / DELETE | `/wishes/:id` | sí | Lectura / edición / borrado |
| POST | `/wishes/:id/to-collection` | sí | Body = ficha de libro; crea libro y cierra el deseo |

### Estadísticas

| Método | Ruta | Auth | Notas |
|--------|------|------|--------|
| GET | `/stats` | sí | Overview: lengua, país, década, editorial, estado, condición, gasto, puntuaciones, crecimiento, figuras, wishlist abiertos |

---

## Ejemplo rápido (API)

```bash
# Registro
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"handle\":\"cinefilo\",\"password\":\"secreto1\"}"

# Login → copiar accessToken
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"handle\":\"cinefilo\",\"password\":\"secreto1\"}"

# Listar libros
curl -s http://localhost:3000/api/books \
  -H "Authorization: Bearer TOKEN"

# Comprobar duplicado por ISBN
curl -s -X POST http://localhost:3000/api/books/check-duplicate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"isbn\":\"9780306406157\"}"

# Estadísticas
curl -s http://localhost:3000/api/stats \
  -H "Authorization: Bearer TOKEN"
```

---

## Tests

```bash
# Backend — unitarios
cd backend && npm test

# Backend — e2e (incluye flujo crítico: login → alta → anti-duplicado → búsqueda → wishlist)
cd backend && npm run test:e2e

# Frontend — unitarios (Chrome headless)
cd frontend && npm run test:ci
```

| Suite | Comando | Contenido aproximado |
|-------|---------|----------------------|
| Backend unit | `npm test` | Auth, books, wishes, stats, Prisma |
| Backend e2e | `npm run test:e2e` | HTTP real + flujo crítico v1 |
| Frontend | `npm run test:ci` | Componentes, filtros, ISBN, wishlist, stats |

---

## Stack y arquitectura

| Capa | Tecnología |
|------|------------|
| View | Angular 19 + SCSS · tipografía Fraunces / Source Serif 4 |
| Controller | NestJS 11 · JWT (Passport) · ValidationPipe |
| Model | Prisma 7 · SQLite (`better-sqlite3`) |

Arquitectura **MVC**: Model (Prisma) · Controller (Nest REST) · View (Angular).

Escaneo de códigos de barras en el front: **ZXing** (`@zxing/browser`).

---

## Roadmap (más adelante)

- **Docker Compose** con PostgreSQL + API Nest (sustituir o complementar SQLite local).
- Posible experimentación con **FastAPI** como API alternativa (no sustituye Nest en la v1).
- Autocompletar ficha / carátula por ISBN vía APIs externas (Open Library, Google Books, etc.).

---

## Solución de problemas

| Problema | Qué revisar |
|----------|-------------|
| Front no carga datos / 401 | API en `localhost:3000`; token en localStorage; CORS no aplica en mismo origen vía proxy si lo configuras, por defecto se llama a `environment.apiUrl` |
| Error de Prisma / DB | `npx prisma migrate dev` con `DATABASE_URL` correcto |
| Escaneo ISBN no abre cámara | Permiso del navegador (HTTPS o localhost); usa entrada manual |
| ISBN ya existe (409) | Otro libro tuyo con el mismo ISBN; usa `check-duplicate` o edita el existente |
| Tests e2e fallan | Que no haya otro proceso usando la misma DB de test; ejecutar `npm run test:e2e` en `backend/` |

---

## Licencia

Proyecto personal / **UNLICENSED** por ahora.
