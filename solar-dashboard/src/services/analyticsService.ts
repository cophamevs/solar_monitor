import apiClient from './apiClient';

export interface AnalyticsSiteData {
    id: string;
    name: string;
    capacityKwp: number;
    production: number;
    specificYield: number;
    criticalAlerts: number;
    downtimeHours: number;
    availability: number;
    productionShare: number;
}

export interface AnalyticsCompareResponse {
    timeRange: 'day' | 'month' | 'year';
    date: string;
    sites: AnalyticsSiteData[];
}

export const analyticsService = {
    async getComparison(timeRange: 'day' | 'month' | 'year', date?: string): Promise<AnalyticsCompareResponse> {
        const params = new URLSearchParams({ time_range: timeRange });
        if (date) params.append('date', date);

        const response = await apiClient.get<AnalyticsCompareResponse>(`/analytics/compare?${params.toString()}`);
        return response.data;
    }
};
