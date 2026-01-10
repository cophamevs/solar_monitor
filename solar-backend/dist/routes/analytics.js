"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../index.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Helper to get time range
const getTimeRange = (range, dateStr) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    let startDate = new Date(date);
    let endDate = new Date(date);
    switch (range) {
        case 'month':
            startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            break;
        case 'year':
            startDate = new Date(date.getFullYear(), 0, 1);
            endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
            break;
        case 'day':
        default:
            startDate = new Date(date.setHours(0, 0, 0, 0));
            endDate = new Date(date.setHours(23, 59, 59, 999));
            break;
    }
    return { startDate, endDate };
};
// GET /compare
router.get('/compare', async (req, res, next) => {
    try {
        const { time_range = 'day', date } = req.query;
        const { startDate, endDate } = getTimeRange(time_range, date);
        // 1. Get all sites with devices
        const sites = await index_js_1.prisma.site.findMany({
            include: {
                devices: {
                    select: { id: true }
                }
            }
        });
        const results = [];
        let totalSystemProduction = 0;
        // 2. Process each site
        for (const site of sites) {
            const deviceIds = site.devices.map(d => d.id);
            if (deviceIds.length === 0)
                continue;
            // A. Calculate Production (kWh) via Raw SQL & TimescaleDB
            // We sum up hourly averages.
            // Power (kW) * 1 hour = Energy (kWh)
            const productionQuery = await index_js_1.prisma.$queryRaw `
                SELECT SUM(avg_val) as total_production
                FROM (
                    SELECT AVG(value) as avg_val
                    FROM telemetry
                    WHERE "device_id" IN (${client_1.Prisma.join(deviceIds)})
                    AND "parameter_key" = 'power'
                    AND time >= ${startDate}
                    AND time <= ${endDate}
                    AND time <= ${endDate}
                    GROUP BY date_trunc('hour', time)
                ) as hourly_avg
            `;
            const productionKwh = Number(productionQuery[0]?.total_production || 0);
            totalSystemProduction += productionKwh;
            // B. Critical Alerts
            // Group count by site_id/level is efficiently done by Prisma aggregate or count
            const criticalAlerts = await index_js_1.prisma.alert.count({
                where: {
                    siteId: site.id,
                    level: 'CRITICAL',
                    createdAt: { gte: startDate, lte: endDate }
                }
            });
            // C. Downtime Analysis (Raw SQL)
            // Identify 5-min buckets where average power is 0 (or near 0) during sun hours (6-18)
            const downtimeQuery = await index_js_1.prisma.$queryRaw `
                SELECT COUNT(*) as down_buckets
                FROM (
                    SELECT AVG(value) as val
                    FROM telemetry
                    WHERE "device_id" IN (${client_1.Prisma.join(deviceIds)})
                    AND "parameter_key" = 'power'
                    AND time >= ${startDate}
                    AND time <= ${endDate}
                    AND EXTRACT(HOUR FROM time) >= 6 
                    AND EXTRACT(HOUR FROM time) < 18
                    AND EXTRACT(HOUR FROM time) < 18
                    GROUP BY date_trunc('hour', time)
                ) as buckets
                WHERE val = 0
            `;
            const downBuckets = Number(downtimeQuery[0]?.down_buckets || 0);
            const estimatedDowntimeHours = (downBuckets * 5) / 60;
            // D. Availability
            // Total Sun Hours in period
            // For 'day', it's up to 12h. For 'month', 12h * days.
            const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
            // Approx sun hours fraction (simple assumption: 12h/24h = 0.5)
            // Or better: calculated based on the day range * 12.
            const daysInPeriod = Math.max(1, Math.ceil(totalHours / 24));
            const sunHours = daysInPeriod * 12;
            const availability = sunHours > 0
                ? Math.max(0, Math.min(100, ((sunHours - estimatedDowntimeHours) / sunHours) * 100))
                : 0;
            results.push({
                id: site.id,
                name: site.name,
                capacityKwp: Number(site.capacityKwp),
                production: productionKwh,
                specificYield: site.capacityKwp ? productionKwh / Number(site.capacityKwp) : 0,
                criticalAlerts,
                downtimeHours: estimatedDowntimeHours,
                availability
            });
        }
        // Calculate shares
        const finalResults = results.map(r => ({
            ...r,
            productionShare: totalSystemProduction > 0 ? (r.production / totalSystemProduction) * 100 : 0
        }));
        res.json({
            timeRange: time_range,
            date: startDate.toISOString(),
            sites: finalResults
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map