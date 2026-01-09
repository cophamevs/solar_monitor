
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function check() {
    const devices = await prisma.device.count();
    const telemetry = await prisma.telemetry.count();
    const alerts = await prisma.alert.count();
    const sites = await prisma.site.count();

    console.log('--- DB Counts ---');
    console.log('Sites:', sites);
    console.log('Devices:', devices);
    console.log('Telemetry:', telemetry);
    console.log('Alerts:', alerts);

    if (telemetry > 0) {
        const first = await prisma.telemetry.findFirst({ orderBy: { time: 'asc' } });
        const last = await prisma.telemetry.findFirst({ orderBy: { time: 'desc' } });
        console.log('Telemetry Range:', first?.time, 'to', last?.time);
    }

    if (alerts > 0) {
        const alertsList = await prisma.alert.findMany({ take: 5 });
        console.log('Sample Alerts:', alertsList);
    }
}

check().finally(() => prisma.$disconnect());
