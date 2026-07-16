# Cinebook — Cinema Library

Catálogo personal de libros de cine.

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
| Controller | NestJS + JWT |
| Model | Prisma + SQLite local; PostgreSQL más adelante |
