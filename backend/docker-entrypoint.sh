#!/bin/sh
set -e

echo "Waiting for database…"
i=0
until node -e "
const { Pool } = require('pg');
const url = process.env.DATABASE_URL || '';
const needSsl = /sslmode=require|neon\\.tech|render\\.com/i.test(url);
const pool = new Pool({
  connectionString: url,
  ssl: needSsl ? { rejectUnauthorized: false } : undefined,
});
pool.query('SELECT 1').then(() => { pool.end(); process.exit(0); }).catch((e) => { console.error(e.message); process.exit(1); });
"; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "Database not ready after 60 attempts"
    exit 1
  fi
  sleep 2
done

echo "Applying schema (prisma db push)…"
npx prisma db push --accept-data-loss

echo "Starting Cinebook API…"
exec node dist/src/main.js
