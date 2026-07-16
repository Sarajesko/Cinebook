# Cinebook — Cinema Library

Catálogo personal de libros de cine. Documentación de producto: [`contexto.md`](contexto.md), [`ideas.md`](ideas.md), [`checklist.md`](checklist.md).

## Estructura

```
frontend/   Angular (View)
backend/    NestJS (Controller / API)
```

## Requisitos

- Node.js 22+
- npm 11+

## Arranque en local

### API (NestJS)

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API: [http://localhost:3000/api](http://localhost:3000/api)

### Front (Angular)

```bash
cd frontend
npm install
npm start
```

App: [http://localhost:4200](http://localhost:4200)

## Stack (v1)

| Capa | Tecnología |
|------|------------|
| View | Angular |
| Controller | NestJS + JWT (auth en checklist 03) |
| Model | Prisma + SQLite local (checklist 02); PostgreSQL más adelante |

## Checklist

El desarrollo sigue [`checklist.md`](checklist.md): un apartado a la vez; avanzar con `siguiente` en el chat.
