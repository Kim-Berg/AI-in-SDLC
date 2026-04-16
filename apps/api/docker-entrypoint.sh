#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --schema=prisma/schema.docker.prisma --skip-generate

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
  echo "Seeding complete."
fi

echo "Starting Zava API..."
exec node dist/index.js
