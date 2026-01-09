import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { createError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            throw createError('Username and password required', 400, 'VALIDATION_ERROR');
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            throw createError('User not found', 404, 'USER_NOT_FOUND');
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Register (admin only in production)
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, role = 'OPERATOR' } = req.body;

        if (!username || !password) {
            throw createError('Username and password required', 400, 'VALIDATION_ERROR');
        }

        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email || undefined }
                ]
            }
        });

        if (existing) {
            throw createError('Username or email already exists', 409, 'USER_EXISTS');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

export default router;
