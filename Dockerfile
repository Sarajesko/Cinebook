# syntax=docker/dockerfile:1
# Full stack: Angular UI + Nest API + static serve (one public URL).
# Use with Postgres (Railway / Render / Compose).

# ── Frontend ──────────────────────────────────────────────
FROM node:22-bookworm-slim AS frontend
WORKDIR /front

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ── Backend build ─────────────────────────────────────────
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN npm install

COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./
COPY backend/tsconfig*.json backend/nest-cli.json ./
COPY backend/src ./src

RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma \
  && npx prisma generate \
  && npm run build

# ── Runner ────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=backend-build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/prisma.config.ts ./
COPY backend/docker-entrypoint.sh ./
# Angular 19 application builder → browser/
COPY --from=frontend /front/dist/frontend/browser ./public

RUN sed -i 's/\r$//' docker-entrypoint.sh \
  && chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
