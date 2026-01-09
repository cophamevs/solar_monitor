#!/bin/bash

# Define ports to clear
PORTS="3000 5173 5174 5175 5176 5177 8000"

echo "=========================================="
echo "Clearing ports: $PORTS"
echo "=========================================="

# Check and activate .venv if exists
if [ -d ".venv" ]; then
    echo "Found .venv, activating..."
    source .venv/bin/activate
fi

# Kill processes on these ports
fuser -k -v 3000/tcp 5173/tcp 5174/tcp 5175/tcp 5176/tcp 5177/tcp 8000/tcp > /dev/null 2>&1

echo "Ports cleared."
sleep 2

echo "=========================================="
echo "Setting up Database..."
echo "=========================================="
cd solar-backend

echo "1. Generating Prisma Client..."
npx prisma generate

echo "2. Syncing Database Schema..."
npx prisma db push

echo "3. Seeding Data (Users/Devices)..."
npx prisma db seed

echo "=========================================="
echo "Starting Backend..."
echo "=========================================="
npm run dev &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 5

echo "=========================================="
echo "Starting Dashboard..."
echo "=========================================="
cd ../solar-dashboard
npm run dev -- --host &
FRONTEND_PID=$!
echo "Dashboard started with PID $FRONTEND_PID"

echo "=========================================="
echo "Services are running."
echo "Press Ctrl+C to stop everything."
echo "=========================================="

# Trap Ctrl+C to kill child processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Wait for processes
wait
