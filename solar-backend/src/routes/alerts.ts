import { Router } from 'express';
import { prisma } from '../index.js';
import { io } from '../index.js';
import { createError } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// List alerts
router.get('/', async (req, res, next) => {
    try {
        const { level, status, site_id, device_id, start_date, end_date, page = '1', limit = '20' } = req.query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where = {
            ...(level && { level: level as any }),
            ...(status && { status: status as any }),
            ...(site_id && { siteId: site_id as string }),
            ...(device_id && { deviceId: device_id as string }),
            ...(start_date && end_date && {
                createdAt: {
                    gte: new Date(start_date as string),
                    lte: new Date(end_date as string)
                }
            })
        };

        const [alerts, total] = await Promise.all([
            prisma.alert.findMany({
                where,
                include: {
                    device: { select: { id: true, name: true } },
                    site: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit as string)
            }),
            prisma.alert.count({ where })
        ]);

        res.json({
            data: alerts,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get alert by ID
router.get('/:id', async (req, res, next) => {
    try {
        const alert = await prisma.alert.findUnique({
            where: { id: req.params.id },
            include: {
                device: true,
                site: true,
                acknowledger: {
                    select: { id: true, username: true }
                }
            }
        });

        if (!alert) {
            throw createError('Alert not found', 404, 'ALERT_NOT_FOUND');
        }

        res.json(alert);
    } catch (error) {
        next(error);
    }
});

// Acknowledge alert
router.put('/:id/acknowledge', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const alert = await prisma.alert.update({
            where: { id: req.params.id },
            data: {
                status: 'ACKNOWLEDGED',
                acknowledgedBy: req.user?.id,
                acknowledgedAt: new Date()
            },
            include: {
                device: { select: { id: true, name: true } },
                site: { select: { id: true, name: true } }
            }
        });

        io.emit('alert_update', alert);

        res.json(alert);
    } catch (error) {
        next(error);
    }
});

// Resolve alert
router.put('/:id/resolve', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const alert = await prisma.alert.update({
            where: { id: req.params.id },
            data: {
                status: 'RESOLVED',
                ...(req.body.comment && { comment: req.body.comment })
            },
            include: {
                device: { select: { id: true, name: true } },
                site: { select: { id: true, name: true } }
            }
        });

        io.emit('alert_update', alert);

        res.json(alert);
    } catch (error) {
        next(error);
    }
});

// Add comment to alert
router.put('/:id/comment', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { comment } = req.body;

        if (!comment) {
            throw createError('Comment is required', 400, 'VALIDATION_ERROR');
        }

        const alert = await prisma.alert.update({
            where: { id: req.params.id },
            data: { comment }
        });

        res.json(alert);
    } catch (error) {
        next(error);
    }
});

// Create alert (for testing/manual creation)
router.post('/', authenticate, authorize('ADMIN', 'ENGINEER'), async (req: AuthRequest, res, next) => {
    try {
        const { deviceId, siteId, level, message } = req.body;

        if (!level || !message) {
            throw createError('Level and message are required', 400, 'VALIDATION_ERROR');
        }

        const alert = await prisma.alert.create({
            data: {
                deviceId,
                siteId,
                level,
                message,
                status: 'OPEN'
            },
            include: {
                device: { select: { id: true, name: true } },
                site: { select: { id: true, name: true } }
            }
        });

        io.emit('alert_new', alert);

        res.status(201).json(alert);
    } catch (error) {
        next(error);
    }
});

export default router;
