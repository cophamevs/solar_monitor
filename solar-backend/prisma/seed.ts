/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with comprehensive mock data...');

    // Clean existing data used for testing
    // Note: We don't truncate user to avoid losing admin/operator if exists, but upsert handles it.
    // Ideally we might want to clean telemetry/alerts.
    await prisma.alert.deleteMany({});
    await prisma.telemetry.deleteMany({});
    await prisma.device.deleteMany({});
    await prisma.site.deleteMany({});

    // 1. Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            passwordHash: adminPassword
        },
        create: {
            username: 'admin',
            email: 'admin@solar.local',
            passwordHash: adminPassword,
            role: 'ADMIN'
        }
    });

    const operatorPassword = await bcrypt.hash('operator123', 10);
    const operator = await prisma.user.upsert({
        where: { username: 'operator' },
        update: {
            passwordHash: operatorPassword
        },
        create: {
            username: 'operator',
            email: 'operator@solar.local',
            passwordHash: operatorPassword,
            role: 'OPERATOR'
        }
    });

    // 2. Sites
    const sitesData = [
        { name: 'Factory A - Roof', capacity: 500, loc: 'Industrial Zone A' },
        { name: 'Office B - Carport', capacity: 120, loc: 'City Center' },
        { name: 'Warehouse C - Ground', capacity: 1000, loc: 'Suburbs Area' }
    ];

    const sites = [];
    for (const s of sitesData) {
        sites.push(await prisma.site.create({
            data: { name: s.name, capacityKwp: s.capacity, location: s.loc }
        }));
    }
    console.log(`✅ Created ${sites.length} sites`);

    // 3. Devices
    // Distribute devices among sites
    const devices = [];

    // Site 0: 5 Inverters, 1 Meter
    for (let i = 1; i <= 5; i++) {
        devices.push(await prisma.device.create({
            data: {
                siteId: sites[0].id,
                name: `Inv-A-0${i}`,
                type: 'INVERTER',
                protocol: 'MODBUS_TCP',
                ipAddress: `192.168.1.10${i}`,
                status: 'ONLINE',
                lastSeen: new Date()
            }
        }));
    }
    devices.push(await prisma.device.create({
        data: {
            siteId: sites[0].id,
            name: `Meter-A-Main`,
            type: 'METER',
            protocol: 'MODBUS_RTU',
            status: 'ONLINE',
            lastSeen: new Date()
        }
    }));

    // Site 1: 2 Inverters
    for (let i = 1; i <= 2; i++) {
        devices.push(await prisma.device.create({
            data: {
                siteId: sites[1].id,
                name: `Inv-B-0${i}`,
                type: 'INVERTER',
                protocol: 'MODBUS_TCP',
                ipAddress: `192.168.2.10${i}`,
                status: i === 2 ? 'WARNING' : 'ONLINE',
                lastSeen: new Date()
            }
        }));
    }

    // Site 2: 8 Inverters (Large)
    for (let i = 1; i <= 8; i++) {
        devices.push(await prisma.device.create({
            data: {
                siteId: sites[2].id,
                name: `Inv-C-0${i}`,
                type: 'INVERTER',
                protocol: 'MODBUS_TCP',
                ipAddress: `192.168.3.10${i}`,
                status: i === 5 ? 'OFFLINE' : 'ONLINE',
                lastSeen: i === 5 ? new Date(Date.now() - 86400000) : new Date() // Offline since yesterday
            }
        }));
    }
    console.log(`✅ Created ${devices.length} devices`);

    // 4. Telemetry History (Last 30 days)
    console.log('⏳ Generating 30 days of telemetry (this may take a moment)...');
    const telemetryBatch = [];
    const now = new Date();
    const DAYS = 30;

    // Function to generate bell curve power
    const getPower = (hour: number, capacity: number) => {
        if (hour < 6 || hour >= 18) return 0;
        const peak = 12;
        const dist = Math.abs(hour - peak);
        const factor = Math.max(0, 1 - (dist / 6));
        // Add random cloud cover noise
        const noise = 0.8 + Math.random() * 0.2;
        return (capacity / 5) * factor * noise; // Assume inverter size is ~1/5 of site capacity or arbitrary
        // Better: define inverter capacity.
    };

    const inverterCapacity = 50; // 50kW per inverter

    for (let d = 0; d < DAYS; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);

        // Per day logic
        for (const device of devices) {
            if (device.type !== 'INVERTER') continue;
            if (device.status === 'OFFLINE' && d < 2) continue; // Simulate offline for recent days

            let dailyEnergy = 0;

            // 96 intervals (15 mins)
            for (let h = 0; h < 24; h++) {
                for (let m = 0; m < 60; m += 15) {
                    const timestamp = new Date(date);
                    timestamp.setHours(h, m, 0, 0);

                    // Skip future
                    if (timestamp > now) continue;

                    const power = getPower(h + m / 60, inverterCapacity);
                    dailyEnergy += (power * 0.25); // kWh = kW * 0.25h

                    telemetryBatch.push(
                        { deviceId: device.id, time: timestamp, parameterKey: 'power', value: Number(power.toFixed(2)) },
                        { deviceId: device.id, time: timestamp, parameterKey: 'energy_today', value: Number(dailyEnergy.toFixed(2)) },
                        { deviceId: device.id, time: timestamp, parameterKey: 'voltage', value: Number((220 + Math.random() * 5).toFixed(1)) },
                        { deviceId: device.id, time: timestamp, parameterKey: 'temperature', value: Number((30 + power / 2).toFixed(1)) }
                    );

                    // Batch insert to avoid RAM overflow
                    if (telemetryBatch.length >= 5000) {
                        await prisma.telemetry.createMany({ data: telemetryBatch, skipDuplicates: true });
                        telemetryBatch.length = 0;
                    }
                }
            }
        }
    }
    // Final batch
    if (telemetryBatch.length > 0) {
        await prisma.telemetry.createMany({ data: telemetryBatch, skipDuplicates: true });
    }
    console.log('✅ Generated telemetry history');

    // 5. Alerts
    const alertTypes = [
        { level: 'CRITICAL', msg: 'Inverter Grid Fault', status: 'OPEN' },
        { level: 'WARNING', msg: 'High Temperature Warning', status: 'OPEN' },
        { level: 'MINOR', msg: 'Communication Delay', status: 'ACKNOWLEDGED' },
        { level: 'WARNING', msg: 'Low Efficiency Detected', status: 'RESOLVED' }
    ];

    const alerts = [];
    for (let i = 0; i < 20; i++) {
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        const alarm = alertTypes[Math.floor(Math.random() * alertTypes.length)];

        alerts.push({
            deviceId: randomDevice.id,
            siteId: randomDevice.siteId,
            level: alarm.level as any,
            message: alarm.msg,
            status: alarm.status as any,
            createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
        });
    }

    await prisma.alert.createMany({ data: alerts });
    console.log('✅ Created sample alerts');

    // 6. Profiles
    await prisma.modbusProfile.create({
        data: {
            deviceType: 'INVERTER',
            name: 'Standard Inverter Profile',
            registersMap: [
                { name: 'power', address: 40001, dataType: 'uint16', scale: 0.1, unit: 'kW' },
                { name: 'energy_today', address: 40002, dataType: 'uint32', scale: 0.1, unit: 'kWh' }
            ]
        }
    });

    console.log('\n🎉 Database seeding completed with RICH DATA!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
