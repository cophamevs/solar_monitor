export declare class DashboardService {
    /**
     * Get global dashboard summary
     * Includes power stats, reactor counts, and alarm counts
     */
    static getSummary(): Promise<{
        currentPower: number;
        yieldToday: number;
        totalYield: number;
        totalPlants: number;
        onlinePlants: number;
        totalDevices: number;
        onlineDevices: number;
        totalAlarms: number;
    }>;
    /**
     * Get plant status distribution
     */
    static getPlantStatus(): Promise<{
        normal: number;
        warning: number;
        offline: number;
    }>;
    /**
     * Get alarm summary by severity
     */
    static getAlarmSummary(): Promise<{
        critical: number;
        major: number;
        minor: number;
        warning: number;
    }>;
    /**
     * Get energy flow data for a specific site
     */
    static getEnergyFlow(siteId: string): Promise<{
        pv: number;
        grid: number;
        load: number;
        battery: number;
        soc: number;
        totalYield: number;
    }>;
}
//# sourceMappingURL=dashboard.service.d.ts.map