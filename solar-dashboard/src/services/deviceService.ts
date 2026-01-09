import apiClient from './apiClient';

export interface Device {
    id: string;
    siteId: string;
    name: string;
    type: 'INVERTER' | 'METER' | 'SENSOR';
    protocol: string;
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'CRITICAL';
    lastSeen?: string;
    site?: { id: string; name: string };
    _count?: { alerts: number };
}

export const deviceService = {
    async list(filters?: { siteId?: string; type?: string; status?: string }): Promise<Device[]> {
        const response = await apiClient.get<Device[]>('/devices', { params: filters });
        return response.data;
    },

    async getRealtime(id: string) {
        const response = await apiClient.get<{ readings: Record<string, { value: number; time: string }> }>(`/devices/${id}/realtime`);
        return response.data;
    },

    async getTelemetry(id: string, params: { start_date?: string; end_date?: string; interval?: string }) {
        const response = await apiClient.get<{ data: Array<{ time: string; power?: number; load?: number }> }>(`/devices/${id}/telemetry`, { params });
        return response.data;
    }
};
