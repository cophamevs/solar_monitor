#!/bin/bash
# Start MQTT Simulator
# This script sends simulated Huawei-like telemetry data to the MQTT broker

cd "$(dirname "$0")/solar-backend"

echo "🚀 Starting MQTT Simulator..."
echo "   Broker: ${MQTT_BROKER_URL:-mqtt://localhost:1883}"
echo "   Press Ctrl+C to stop"
echo ""

npx ts-node scripts/mqtt-simulator.ts
