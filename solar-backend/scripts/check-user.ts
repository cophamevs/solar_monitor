import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    console.log('Admin found:', !!admin);
    if (admin) {
        console.log('Hash in DB:', admin.passwordHash);
        const match = await bcrypt.compare('admin123', admin.passwordHash);
        console.log('Password matches:', match);
    }
}

check().finally(() => prisma.$disconnect());
