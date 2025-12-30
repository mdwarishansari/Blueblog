#!/usr/bin/env bash
set -e

echo "Building..."
npm run build

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Starting server..."
node dist/src/server.js
