"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const index_js_2 = require("../index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// List alerts
router.get('/', async (req, res, next) => {
    try {
        const { level, status, site_id, device_id, start_date, end_date, page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            ...(level && { level: level }),
            ...(status && { status: status }),
            ...(site_id && { siteId: site_id }),
            ...(device_id && { deviceId: device_id }),
            ...(start_date && end_date && {
                createdAt: {
                    gte: new Date(start_date),
                    lte: new Date(end_date)
                }
            })
        };
        const [alerts, total] = await Promise.all([
            index_js_1.prisma.alert.findMany({
                where,
                include: {
                    device: { select: { id: true, name: true } },
                    site: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            index_js_1.prisma.alert.count({ where })
        ]);
        res.json({
            data: alerts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Get alert by ID
router.get('/:id', async (req, res, next) => {
    try {
        const alert = await index_js_1.prisma.alert.findUnique({
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
            throw (0, errorHandler_js_1.createError)('Alert not found', 404, 'ALERT_NOT_FOUND');
        }
        res.json(alert);
    }
    catch (error) {
        next(error);
    }
});
// Acknowledge alert
router.put('/:id/acknowledge', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const alert = await index_js_1.prisma.alert.update({
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
        index_js_2.io.emit('alert_update', alert);
        res.json(alert);
    }
    catch (error) {
        next(error);
    }
});
// Resolve alert
router.put('/:id/resolve', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const alert = await index_js_1.prisma.alert.update({
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
        index_js_2.io.emit('alert_update', alert);
        res.json(alert);
    }
    catch (error) {
        next(error);
    }
});
// Add comment to alert
router.put('/:id/comment', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { comment } = req.body;
        if (!comment) {
            throw (0, errorHandler_js_1.createError)('Comment is required', 400, 'VALIDATION_ERROR');
        }
        const alert = await index_js_1.prisma.alert.update({
            where: { id: req.params.id },
            data: { comment }
        });
        res.json(alert);
    }
    catch (error) {
        next(error);
    }
});
// Create alert (for testing/manual creation)
router.post('/', auth_js_1.authenticate, (0, auth_js_1.authorize)('ADMIN', 'ENGINEER'), async (req, res, next) => {
    try {
        const { deviceId, siteId, level, message } = req.body;
        if (!level || !message) {
            throw (0, errorHandler_js_1.createError)('Level and message are required', 400, 'VALIDATION_ERROR');
        }
        const alert = await index_js_1.prisma.alert.create({
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
        index_js_2.io.emit('alert_new', alert);
        res.status(201).json(alert);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=alerts.js.map