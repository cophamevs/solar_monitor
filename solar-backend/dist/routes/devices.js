"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const client_1 = require("@prisma/client");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const telemetryAggregator_js_1 = require("../utils/telemetryAggregator.js");
const router = (0, express_1.Router)();
// List all devices
router.get('/', async (req, res, next) => {
    try {
        const { siteId, type, status } = req.query;
        const devices = await index_js_1.prisma.device.findMany({
            where: {
                ...(siteId && { siteId: siteId }),
                ...(type && { type: type }),
                ...(status && { status: status })
            },
            include: {
                site: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { alerts: { where: { status: 'OPEN' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(devices);
    }
    catch (error) {
        next(error);
    }
});
// Get device by ID
router.get('/:id', async (req, res, next) => {
    try {
        const device = await index_js_1.prisma.device.findUnique({
            where: { id: req.params.id },
            include: {
                site: true,
                alerts: {
                    where: { status: 'OPEN' },
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!device) {
            throw (0, errorHandler_js_1.createError)('Device not found', 404, 'DEVICE_NOT_FOUND');
        }
        res.json(device);
    }
    catch (error) {
        next(error);
    }
});
// Get device telemetry
router.get('/:id/telemetry', async (req, res, next) => {
    try {
        const { start_date, end_date, interval, parameters } = req.query;
        const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = end_date ? new Date(end_date) : new Date();
        const paramList = parameters ? parameters.split(',') : undefined;
        if (interval && !(0, telemetryAggregator_js_1.isValidInterval)(interval)) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid interval' } });
            return;
        }
        let rawData = [];
        let bucketQuery = client_1.Prisma.empty;
        let groupBy = client_1.Prisma.empty;
        if (interval && interval !== 'raw') {
            // Handle aggregation
            if (interval === '5min') {
                // 5-minute buckets using PostgreSQL floor-based approach
                rawData = await index_js_1.prisma.$queryRaw `
                    SELECT 
                        to_timestamp(floor(extract(epoch from time) / 300) * 300) as bucket,
                        parameter_key as "parameterKey",
                        AVG(value) as value
                    FROM telemetry
                    WHERE device_id = ${req.params.id}
                    AND time >= ${startDate}
                    AND time <= ${endDate}
                    ${paramList ? client_1.Prisma.sql `AND parameter_key IN (${client_1.Prisma.join(paramList)})` : client_1.Prisma.empty}
                    GROUP BY bucket, parameter_key
                    ORDER BY bucket ASC
                `;
            }
            else {
                // Standard intervals using date_trunc
                const bucketSize = interval === 'hour' ? 'hour'
                    : interval === 'day' ? 'day'
                        : interval === 'month' ? 'month'
                            : 'minute';
                rawData = await index_js_1.prisma.$queryRaw `
                    SELECT 
                        date_trunc(${bucketSize}, time) as bucket,
                        parameter_key as "parameterKey",
                        AVG(value) as value
                    FROM telemetry
                    WHERE device_id = ${req.params.id}
                    AND time >= ${startDate}
                    AND time <= ${endDate}
                    ${paramList ? client_1.Prisma.sql `AND parameter_key IN (${client_1.Prisma.join(paramList)})` : client_1.Prisma.empty}
                    GROUP BY bucket, parameter_key
                    ORDER BY bucket ASC
                `;
            }
        }
        else {
            // Raw data query (no aggregation)
            const telemetry = await index_js_1.prisma.telemetry.findMany({
                where: {
                    deviceId: req.params.id,
                    time: { gte: startDate, lte: endDate },
                    ...(paramList && { parameterKey: { in: paramList } })
                },
                orderBy: { time: 'asc' }
            });
            // Map to common structure for helper
            rawData = telemetry.map(t => ({
                bucket: t.time,
                parameterKey: t.parameterKey,
                value: t.value || 0
            }));
        }
        // Use helper to group data
        const data = (0, telemetryAggregator_js_1.groupTelemetryByTime)(rawData);
        res.json({
            deviceId: req.params.id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            interval: interval || 'raw',
            data
        });
    }
    catch (error) {
        next(error);
    }
});
// Get latest device readings
router.get('/:id/realtime', async (req, res, next) => {
    try {
        // Try to get recent data (last 1 hour)
        let latestReadings = await index_js_1.prisma.telemetry.findMany({
            where: {
                deviceId: req.params.id,
                time: {
                    gte: new Date(Date.now() - 60 * 60 * 1000) // Last 1 hour
                }
            },
            orderBy: { time: 'desc' },
            distinct: ['parameterKey']
        });
        // If no recent data, get the absolute latest readings regardless of time
        if (latestReadings.length === 0) {
            latestReadings = await index_js_1.prisma.telemetry.findMany({
                where: {
                    deviceId: req.params.id
                },
                orderBy: { time: 'desc' },
                distinct: ['parameterKey'],
                take: 10
            });
        }
        const readings = {};
        for (const t of latestReadings) {
            readings[t.parameterKey] = {
                value: t.value || 0,
                time: t.time.toISOString()
            };
        }
        res.json({
            deviceId: req.params.id,
            readings
        });
    }
    catch (error) {
        next(error);
    }
});
// Create device
router.post('/', async (req, res, next) => {
    try {
        const { siteId, name, type, protocol, ipAddress, port, slaveId, 
        // MODBUS_RTU
        serialPort, baudRate, dataBits, parity, stopBits, 
        // IEC104
        commonAddress, 
        // BACNET_IP
        deviceInstance, 
        // MELSEC
        networkNumber, stationNumber } = req.body;
        if (!siteId || !name || !type || !protocol) {
            throw (0, errorHandler_js_1.createError)('Missing required fields', 400, 'VALIDATION_ERROR');
        }
        const device = await index_js_1.prisma.device.create({
            data: {
                siteId,
                name,
                type,
                protocol,
                ipAddress,
                port: port || 502,
                slaveId: slaveId || 1,
                // MODBUS_RTU
                serialPort,
                baudRate,
                dataBits,
                parity,
                stopBits,
                // IEC104
                commonAddress,
                // BACNET_IP
                deviceInstance,
                // MELSEC
                networkNumber,
                stationNumber
            }
        });
        res.status(201).json(device);
    }
    catch (error) {
        next(error);
    }
});
// Update device
router.put('/:id', async (req, res, next) => {
    try {
        const { name, type, protocol, ipAddress, port, slaveId, status } = req.body;
        const device = await index_js_1.prisma.device.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(protocol && { protocol }),
                ...(ipAddress !== undefined && { ipAddress }),
                ...(port !== undefined && { port }),
                ...(slaveId !== undefined && { slaveId }),
                ...(status && { status })
            }
        });
        res.json(device);
    }
    catch (error) {
        next(error);
    }
});
// Delete device
router.delete('/:id', async (req, res, next) => {
    try {
        await index_js_1.prisma.device.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=devices.js.map