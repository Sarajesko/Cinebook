#!/bin/sh
set -e

echo "Waiting for database…"
i=0
until node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1').then(() => { pool.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "Database not ready after 30 attempts"
    exit 1
  fi
  sleep 1
done

echo "Applying schema (prisma db push)…"
npx prisma db push --accept-data-loss

echo "Starting Cinebook API…"
exec node dist/src/main.js
