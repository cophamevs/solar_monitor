import { prisma } from '../index.js';

export class DashboardService {
    /**
     * Get global dashboard summary
     * Includes power stats, reactor counts, and alarm counts
     */
    static async getSummary() {
        // Get all sites with devices
        const sites = await prisma.site.findMany({
            include: {
                devices: true,
                _count: {
                    select: { alerts: { where: { status: 'OPEN' } } }
                }
            }
        });

        // Get latest telemetry for power calculation (use pv_power from MQTT)
        const latestPower = await prisma.telemetry.findMany({
            where: {
                parameterKey: 'pv_power',
                time: {
                    gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
                }
            },
            orderBy: { time: 'desc' },
            distinct: ['deviceId']
        });

        const currentPower = latestPower.reduce((sum, t) => sum + (t.value || 0), 0);

        // Get today's energy (energy_today from MQTT)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const latestEnergy = await prisma.telemetry.findMany({
            where: {
                parameterKey: 'energy_today',
                time: { gte: today }
            },
            orderBy: { time: 'desc' },
            distinct: ['deviceId']
        });

        const yieldToday = latestEnergy.reduce((sum, t) => sum + (t.value || 0), 0);

        // Get total yield (energy_total from MQTT)
        const latestTotalEnergy = await prisma.telemetry.findMany({
            where: {
                parameterKey: 'energy_total',
                time: {
                    gte: new Date(Date.now() - 5 * 60 * 1000)
                }
            },
            orderBy: { time: 'desc' },
            distinct: ['deviceId']
        });

        const totalYield = latestTotalEnergy.reduce((sum, t) => sum + (t.value || 0), 0);

        // Count devices by status
        const deviceStats = await prisma.device.groupBy({
            by: ['status'],
            _count: true
        });

        // Count open alerts
        const openAlerts = await prisma.alert.count({
            where: { status: 'OPEN' }
        });

        const onlineDevices = deviceStats.find(d => d.status === 'ONLINE')?._count || 0;

        return {
            currentPower: Math.round(currentPower * 10) / 10,
            yieldToday: Math.round(yieldToday * 10) / 10,
            totalYield: Math.round(totalYield * 10) / 10,
            totalPlants: sites.length,
            onlinePlants: sites.filter(s => s.devices.some(d => d.status === 'ONLINE')).length,
            totalDevices: sites.reduce((sum, s) => sum + s.devices.length, 0),
            onlineDevices,
            totalAlarms: openAlerts
        };
    }

    /**
     * Get plant status distribution
     */
    static async getPlantStatus() {
        const sites = await prisma.site.findMany({
            include: {
                devices: {
                    select: { status: true }
                },
                _count: {
                    select: { alerts: { where: { status: 'OPEN' } } }
                }
            }
        });

        const statusCounts = {
            normal: 0,
            warning: 0,
            offline: 0
        };

        for (const site of sites) {
            const hasOffline = site.devices.every(d => d.status === 'OFFLINE');
            const hasWarning = site.devices.some(d => d.status === 'WARNING' || d.status === 'CRITICAL');

            if (hasOffline) {
                statusCounts.offline++;
            } else if (hasWarning || site._count.alerts > 0) {
                statusCounts.warning++;
            } else {
                statusCounts.normal++;
            }
        }

        return statusCounts;
    }

    /**
     * Get alarm summary by severity
     */
    static async getAlarmSummary() {
        const alertCounts = await prisma.alert.groupBy({
            by: ['level'],
            where: { status: 'OPEN' },
            _count: true
        });

        const summary = {
            critical: 0,
            major: 0,
            minor: 0,
            warning: 0
        };

        for (const count of alertCounts) {
            const level = count.level.toLowerCase() as keyof typeof summary;
            if (Object.prototype.hasOwnProperty.call(summary, level)) {
                summary[level] = count._count;
            }
        }

        return summary;
    }

    /**
     * Get energy flow data for a specific site
     */
    static async getEnergyFlow(siteId: string) {
        // Get devices for this site
        const devices = await prisma.device.findMany({
            where: { siteId, type: 'INVERTER' },
            select: { id: true }
        });

        if (devices.length === 0) {
            return {
                pv: 0,
                grid: 0,
                load: 0,
                battery: 0,
                soc: 0,
                totalYield: 0
            };
        }

        const deviceIds = devices.map(d => d.id);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Fetch latest telemetry for each energy flow parameter
        const flowParams = ['pv_power', 'grid_power', 'load_power', 'battery_power', 'battery_soc', 'energy_total'];

        const latestReadings = await prisma.telemetry.findMany({
            where: {
                deviceId: { in: deviceIds },
                parameterKey: { in: flowParams },
                time: { gte: fiveMinutesAgo }
            },
            orderBy: { time: 'desc' },
            distinct: ['deviceId', 'parameterKey']
        });

        // Aggregate values across all inverters
        const aggregated: Record<string, number> = {
            pv_power: 0,
            grid_power: 0,
            load_power: 0,
            battery_power: 0,
            battery_soc: 0,
            energy_total: 0
        };
        const counts: Record<string, number> = {
            pv_power: 0,
            grid_power: 0,
            load_power: 0,
            battery_power: 0,
            battery_soc: 0,
            energy_total: 0
        };

        for (const reading of latestReadings) {
            aggregated[reading.parameterKey] += reading.value ?? 0;
            counts[reading.parameterKey]++;
        }

        // For SOC, use average instead of sum
        const avgSoc = counts.battery_soc > 0 ? aggregated.battery_soc / counts.battery_soc : 0;

        return {
            pv: Math.round(aggregated.pv_power * 10) / 10,
            grid: Math.round(aggregated.grid_power * 10) / 10,
            load: Math.round(aggregated.load_power * 10) / 10,
            battery: Math.round(aggregated.battery_power * 10) / 10,
            soc: Math.round(avgSoc),
            totalYield: Math.round(aggregated.energy_total * 10) / 10
        };
    }
}
