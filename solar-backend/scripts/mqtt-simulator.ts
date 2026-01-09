import { PrismaClient } from '@prisma/client';
import mqtt from 'mqtt';
import dotenv from 'dotenv';

// Load env
dotenv.config();

const prisma = new PrismaClient();
const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

interface DeviceState {
    id: string;
    energyToday: number;
    energyTotal: number;
    batterySoc: number;
}

function simulateEnergyFlow(hour: number, capacity: number) {
    const isDay = hour >= 6 && hour < 18;

    // PV Power - follows sun curve
    let pvPower = 0;
    if (isDay) {
        const peak = 12;
        const dist = Math.abs(hour - peak);
        const factor = Math.max(0, 1 - (dist / 6));
        pvPower = capacity * factor * (0.8 + Math.random() * 0.2);
    }

    // Load - varies throughout day
    const baseLoad = capacity * 0.3;
    const loadVariation = capacity * 0.2 * Math.random();
    const loadPower = baseLoad + loadVariation;

    // Battery logic: charge during high PV, discharge when PV < load
    let batteryPower = 0;
    const excess = pvPower - loadPower;

    if (excess > 0) {
        // Excess PV → charge battery (positive = charging)
        batteryPower = Math.min(excess * 0.8, capacity * 0.2);
    } else {
        // Deficit → discharge battery (negative = discharging)
        batteryPower = Math.max(excess * 0.5, -capacity * 0.15);
    }

    // Grid = Load + Battery Charging - PV
    // Positive = importing, Negative = exporting
    const gridPower = loadPower + batteryPower - pvPower;

    return {
        pvPower: Number(pvPower.toFixed(2)),
        gridPower: Number(gridPower.toFixed(2)),
        loadPower: Number(loadPower.toFixed(2)),
        batteryPower: Number(batteryPower.toFixed(2)),
    };
}

async function main() {
    console.log('🔌 Connecting to MQTT Broker:', BROKER_URL);
    const client = mqtt.connect(BROKER_URL);

    client.on('connect', async () => {
        console.log('✅ Connected to Broker');

        // Fetch devices
        const devices = await prisma.device.findMany({
            where: { type: 'INVERTER' }
        });

        if (devices.length === 0) {
            console.log('⚠️ No inverters found in DB. Please run "npm run seed" first.');
            return;
        }

        console.log(`Found ${devices.length} inverters:`, devices.map(d => d.name).join(', '));

        // Initialize device states
        const devicesState: DeviceState[] = devices.map(d => ({
            id: d.id,
            energyToday: 0,
            energyTotal: Math.random() * 10000, // Simulate existing total
            batterySoc: 50 + Math.random() * 40, // 50-90%
        }));

        console.log('🚀 Starting Huawei-like simulation (Values updated every 5s)...');

        // Simulation Loop
        setInterval(() => {
            const now = new Date();
            const hour = now.getHours();

            devicesState.forEach(state => {
                const capacity = 50; // 50 kWp nominal
                const flow = simulateEnergyFlow(hour, capacity);

                // Update battery SOC based on charging/discharging
                // batteryPower > 0 = charging, < 0 = discharging
                const socChange = (flow.batteryPower * (5 / 3600)) / 10; // Simple approximation
                state.batterySoc = Math.max(10, Math.min(100, state.batterySoc + socChange));

                // Update energy today
                const energyIncrement = flow.pvPower * (5 / 3600);
                state.energyToday += energyIncrement;
                state.energyTotal += energyIncrement;

                const payload = {
                    timestamp: now.toISOString(),
                    readings: {
                        // Energy Flow (for EnergyFlowDiagram)
                        pv_power: flow.pvPower,
                        grid_power: flow.gridPower,
                        load_power: flow.loadPower,
                        battery_power: flow.batteryPower,
                        battery_soc: Number(state.batterySoc.toFixed(0)),

                        // Detailed readings (for device detail page)
                        pv1_voltage: Number((320 + Math.random() * 10).toFixed(1)),
                        pv1_current: Number((flow.pvPower > 0 ? flow.pvPower / 640 * 1000 : 0).toFixed(2)),
                        pv2_voltage: Number((318 + Math.random() * 10).toFixed(1)),
                        pv2_current: Number((flow.pvPower > 0 ? flow.pvPower / 640 * 1000 : 0).toFixed(2)),
                        grid_voltage: Number((220 + Math.random() * 5).toFixed(1)),
                        grid_frequency: Number((50 + Math.random() * 0.1).toFixed(2)),
                        energy_today: Number(state.energyToday.toFixed(2)),
                        energy_total: Number(state.energyTotal.toFixed(1)),
                        temperature: Number((30 + (flow.pvPower / 10) + Math.random() * 2).toFixed(1)),
                        status: flow.pvPower > 0 ? 1 : 0, // 1 = producing, 0 = standby
                    }
                };

                const topic = `solar/${state.id}/data`;
                client.publish(topic, JSON.stringify(payload));
            });

            console.log(`[${now.toLocaleTimeString()}] Sent telemetry for ${devices.length} devices.`);

        }, 5000); // Every 5 seconds
    });

    client.on('error', (err) => {
        console.error('MQTT Error:', err);
    });
}

main().catch(console.error);
