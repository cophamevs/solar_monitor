#!/bin/sh
set -e

echo "[Solar Backend] Starting..."

# Wait for PostgreSQL to be ready
echo "[Solar Backend] Waiting for PostgreSQL..."
until nc -z postgres 5432 2>/dev/null; do
  sleep 1
done
echo "[Solar Backend] PostgreSQL is ready"

# Run Prisma db push (create/update tables)
echo "[Solar Backend] Synchronizing database schema..."
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || {
  echo "[Solar Backend] Retrying schema sync..."
  sleep 3
  npx prisma db push --skip-generate --accept-data-loss
}
echo "[Solar Backend] Database schema synchronized"

# Seed admin user inline (no external dependencies)
echo "[Solar Backend] Checking seed data..."
node << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('[Solar Backend] Admin user already exists, skipping seed');
      return;
    }

    console.log('[Solar Backend] Creating admin user...');

    // Create admin user
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@solar.local',
        passwordHash: adminHash,
        role: 'ADMIN'
      }
    });

    // Create operator user
    const operatorHash = await bcrypt.hash('operator123', 10);
    await prisma.user.create({
      data: {
        username: 'operator',
        email: 'operator@solar.local',
        passwordHash: operatorHash,
        role: 'OPERATOR'
      }
    });

    // Create sample site
    const site = await prisma.site.create({
      data: {
        name: 'Demo Solar Plant',
        capacityKwp: 100,
        location: 'Demo Location',
        status: 'active'
      }
    });

    // Create sample device
    await prisma.device.create({
      data: {
        siteId: site.id,
        name: 'Inverter-01',
        type: 'INVERTER',
        protocol: 'MODBUS_TCP',
        ipAddress: '192.168.1.100',
        status: 'ONLINE',
        lastSeen: new Date()
      }
    });

    console.log('[Solar Backend] Seed completed: admin/admin123, operator/operator123');
  } catch (error) {
    console.log('[Solar Backend] Seed error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
EOF

echo "[Solar Backend] Starting server..."
exec node dist/index.js
