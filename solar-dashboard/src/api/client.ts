const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
    token?: string;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Load token from localStorage
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getToken() {
        return this.token;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.error?.message || error.message || 'Request failed');
        }

        return response.json();
    }

    // Auth
    async login(username: string, password: string) {
        const data = await this.request<{ token: string; user: User }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        this.setToken(data.token);
        return data;
    }

    async logout() {
        this.setToken(null);
    }

    async getMe() {
        return this.request<User>('/api/auth/me');
    }

    // Dashboard
    async getDashboardSummary() {
        return this.request<DashboardSummary>('/api/dashboard/summary');
    }

    async getPlantStatus() {
        return this.request<PlantStatusCounts>('/api/dashboard/plant-status');
    }

    async getAlarmSummary() {
        return this.request<AlarmSummaryCounts>('/api/dashboard/alarm-summary');
    }

    // Sites
    async getSites() {
        return this.request<Site[]>('/api/sites');
    }

    async getSite(id: string) {
        return this.request<Site>(`/api/sites/${id}`);
    }

    async getSiteDevices(siteId: string) {
        return this.request<Device[]>(`/api/sites/${siteId}/devices`);
    }

    // Devices
    async getDevices(params?: { siteId?: string; type?: string; status?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.siteId) searchParams.set('siteId', params.siteId);
        if (params?.type) searchParams.set('type', params.type);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return this.request<Device[]>(`/api/devices${query ? `?${query}` : ''}`);
    }

    async getDevice(id: string) {
        return this.request<Device>(`/api/devices/${id}`);
    }

    async getDeviceTelemetry(id: string, params?: { start_date?: string; end_date?: string; parameters?: string; interval?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.start_date) searchParams.set('start_date', params.start_date);
        if (params?.end_date) searchParams.set('end_date', params.end_date);
        if (params?.parameters) searchParams.set('parameters', params.parameters);
        if (params?.interval) searchParams.set('interval', params.interval);

        const query = searchParams.toString();
        return this.request<TelemetryResponse>(`/api/devices/${id}/telemetry${query ? `?${query}` : ''}`);
    }

    async getDeviceRealtime(id: string) {
        return this.request<RealtimeResponse>(`/api/devices/${id}/realtime`);
    }

    // Alerts
    async getAlerts(params?: { level?: string; status?: string; page?: number; limit?: number }) {
        const searchParams = new URLSearchParams();
        if (params?.level) searchParams.set('level', params.level);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));

        const query = searchParams.toString();
        return this.request<AlertsResponse>(`/api/alerts${query ? `?${query}` : ''}`);
    }

    async acknowledgeAlert(id: string) {
        return this.request<Alert>(`/api/alerts/${id}/acknowledge`, { method: 'PUT' });
    }

    async resolveAlert(id: string, comment?: string) {
        return this.request<Alert>(`/api/alerts/${id}/resolve`, {
            method: 'PUT',
            body: JSON.stringify({ comment }),
        });
    }
    // Analytics
    async getAnalyticsCompare(timeRange: 'day' | 'month' | 'year' = 'day', date?: string) {
        const searchParams = new URLSearchParams();
        searchParams.set('time_range', timeRange);
        if (date) searchParams.set('date', date);

        const query = searchParams.toString();
        return this.request<AnalyticsCompareResponse>(`/api/analytics/compare?${query}`);
    }

    // Energy Flow (for EnergyFlowDiagram)
    async getEnergyFlow(siteId: string) {
        return this.request<EnergyFlowData>(`/api/dashboard/energy-flow/${siteId}`);
    }
}

// Types
export interface User {
    id: string;
    username: string;
    email?: string;
    role: string;
}

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

export interface PlantStatusCounts {
    normal: number;
    warning: number;
    offline: number;
}

export interface AlarmSummaryCounts {
    critical: number;
    major: number;
    minor: number;
    warning: number;
}

export interface Site {
    id: string;
    name: string;
    capacityKwp: number;
    location?: string;
    status: string;
    createdAt: string;
    devices?: Device[];
    alerts?: Alert[];
    _count?: { devices: number; alerts: number };
}

export interface Device {
    id: string;
    siteId: string;
    name: string;
    type: 'INVERTER' | 'METER' | 'SENSOR';
    protocol: string;
    ipAddress?: string;
    port: number;
    slaveId: number;
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'CRITICAL';
    lastSeen?: string;
    site?: { id: string; name: string };
    _count?: { alerts: number };
}

export interface Alert {
    id: string;
    deviceId?: string;
    siteId?: string;
    level: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING';
    message: string;
    status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    comment?: string;
    createdAt: string;
    device?: { id: string; name: string };
    site?: { id: string; name: string };
}

export interface AlertsResponse {
    data: Alert[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface TelemetryResponse {
    deviceId: string;
    startDate: string;
    endDate: string;
    interval: string;
    data: Array<{ time: string;[key: string]: number | string }>;
}

export interface RealtimeResponse {
    deviceId: string;
    readings: Record<string, { value: number; time: string }>;
}

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

export interface EnergyFlowData {
    pv: number;
    grid: number;
    load: number;
    battery: number;
    soc: number;
    totalYield: number;
}

export const api = new ApiClient(API_BASE_URL);
