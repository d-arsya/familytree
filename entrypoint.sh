#!/bin/sh
set -e

echo "🚀 Starting container..."

# wait for DB (optional but recommended)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for database..."
  sleep 3
fi

echo "✅ Starting app..."
exec node server.js