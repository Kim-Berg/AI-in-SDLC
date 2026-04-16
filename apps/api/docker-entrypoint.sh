#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --schema=prisma/schema.docker.prisma --skip-generate

echo "Starting Zava API..."
exec node dist/index.js
