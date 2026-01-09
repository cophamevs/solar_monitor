import apiClient from './apiClient';

export interface DashboardSummary {
    currentPower: number;
    yieldToday: number;
    totalYield: number;
    totalPlants: number;
    onlinePlants: number;
    totalDevices: number;
    onlineDevices: number;
    totalAlarms: number;
}

export const dashboardService = {
    async getSummary(): Promise<DashboardSummary> {
        const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
        return response.data;
    },

    async getPlantStatus() {
        const response = await apiClient.get('/dashboard/plant-status');
        return response.data;
    },

    async getAlarmSummary() {
        const response = await apiClient.get('/dashboard/alarm-summary');
        return response.data;
    }
};
