#!/bin/sh
set -e

echo "🚀 Solar Backend Starting..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Check if database needs initialization
echo "🔄 Checking database..."

# Run Prisma db push (create/update tables)
npx prisma db push --skip-generate 2>/dev/null || {
  echo "⚠️ Prisma db push failed, retrying..."
  sleep 2
  npx prisma db push --skip-generate
}

echo "✅ Database schema synchronized"

# Run seed only if users table is empty
echo "🌱 Checking seed data..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('No users found, seeding...');
      process.exit(0); // Need to seed
    } else {
      console.log('Users exist, skipping seed');
      process.exit(1); // Skip seed
    }
  } catch (e) {
    console.log('Table might not exist, seeding...');
    process.exit(0); // Need to seed
  } finally {
    await prisma.\$disconnect();
  }
}
check();
" && npm run seed || echo "✅ Seed skipped (data exists)"

echo "🚀 Starting server..."
exec node dist/index.js
