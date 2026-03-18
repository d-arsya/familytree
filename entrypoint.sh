#!/bin/sh
set -e

echo "🚀 Starting container..."

# wait for DB (optional but recommended)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for database..."
  sleep 3
fi

echo "📦 Running migrations..."
bunx prisma migrate deploy

echo "✅ Starting app..."
exec node server.js