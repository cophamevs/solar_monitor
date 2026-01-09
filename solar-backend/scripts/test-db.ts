
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Testing time_bucket...');
        const result = await prisma.$queryRaw`SELECT 1 as val`;
        console.log('Basic query ok.');

        const bucket = await prisma.$queryRaw`SELECT time_bucket('1 hour', NOW()) as bucket`;
        console.log('Time bucket result:', bucket);
    } catch (e: any) {
        console.error('Time Bucket failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
