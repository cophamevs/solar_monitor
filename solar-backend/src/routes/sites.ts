import { Router } from 'express';
import { prisma } from '../index.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// List all sites
router.get('/', async (req, res, next) => {
    try {
        const sites = await prisma.site.findMany({
            include: {
                devices: {
                    select: {
                        id: true,
                        status: true
                    }
                },
                _count: {
                    select: {
                        devices: true,
                        alerts: { where: { status: 'OPEN' } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(sites);
    } catch (error) {
        next(error);
    }
});

// Get site by ID
router.get('/:id', async (req, res, next) => {
    try {
        const site = await prisma.site.findUnique({
            where: { id: req.params.id },
            include: {
                devices: true,
                alerts: {
                    where: { status: 'OPEN' },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!site) {
            throw createError('Site not found', 404, 'SITE_NOT_FOUND');
        }

        res.json(site);
    } catch (error) {
        next(error);
    }
});

// Create site
router.post('/', async (req, res, next) => {
    try {
        const { name, capacityKwp, location } = req.body;

        if (!name) {
            throw createError('Name is required', 400, 'VALIDATION_ERROR');
        }

        const site = await prisma.site.create({
            data: {
                name,
                capacityKwp,
                location
            }
        });

        res.status(201).json(site);
    } catch (error) {
        next(error);
    }
});

// Update site
router.put('/:id', async (req, res, next) => {
    try {
        const { name, capacityKwp, location, status } = req.body;

        const site = await prisma.site.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(capacityKwp !== undefined && { capacityKwp }),
                ...(location !== undefined && { location }),
                ...(status && { status })
            }
        });

        res.json(site);
    } catch (error) {
        next(error);
    }
});

// Delete site
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma.site.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Get site devices
router.get('/:id/devices', async (req, res, next) => {
    try {
        const devices = await prisma.device.findMany({
            where: { siteId: req.params.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(devices);
    } catch (error) {
        next(error);
    }
});

export default router;
