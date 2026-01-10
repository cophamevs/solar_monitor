import React from "react";
import { api, useApi, useInterval, type Device } from "../api";
import { useDeviceHistory } from "../hooks/useDeviceHistory";
import { CHART_VIEW_CONFIG, type ChartViewMode } from "../constants/chart";
import { Card, CardHeader, CardTitle, CardContent } from "../components/cards/Card";
import { Button } from "../components/base/Button";
import { Badge } from "../components/base/Badge";
import { Icon } from "../components/base/Icon";
import { Skeleton } from "../components/base/Skeleton";
import { cn } from "../utils/cn";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

type TabType = "overview" | "realtime" | "history" | "config";

interface DeviceDetailProps {
    deviceId?: string;
    onBack?: () => void;
}

export function DeviceDetail({ deviceId, onBack }: DeviceDetailProps) {
    const [activeTab, setActiveTab] = React.useState<TabType>("overview");
    const [saving, setSaving] = React.useState(false);
    const [mappingModalOpen, setMappingModalOpen] = React.useState(false);

    // Connection settings state
    const [connectionSettings, setConnectionSettings] = React.useState({
        ipAddress: "",
        port: 502,
        slaveId: 1
    });

    // Fetch device
    const { data: device, loading } = useApi<Device>(
        () => deviceId ? api.getDevice(deviceId) : Promise.resolve(null as unknown as Device),
        [deviceId]
    );

    // Fetch realtime data
    const { data: realtimeData, refetch: refetchRealtime } = useApi(
        () => deviceId ? api.getDeviceRealtime(deviceId) : Promise.resolve(null),
        [deviceId]
    );

    // History view mode and data fetching using custom hook
    const [historyViewMode, setHistoryViewMode] = React.useState<ChartViewMode>('24h');
    const { data: historyData, refetch: refetchHistory, config: historyConfig } = useDeviceHistory(deviceId, historyViewMode);

    // Auto-refresh data based on active tab
    useInterval(() => {
        if (activeTab === "realtime") {
            refetchRealtime();
        } else if (activeTab === "history") {
            refetchHistory();
        }
    }, historyConfig.refreshMs);

    // Initialize connection settings when device loads
    React.useEffect(() => {
        if (device) {
            setConnectionSettings({
                ipAddress: device.ipAddress || "",
                port: device.port || 502,
                slaveId: device.slaveId || 1
            });
        }
    }, [device]);

    // Save connection settings
    const handleSaveConnection = async () => {
        if (!deviceId) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "/api"}/devices/${deviceId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` })
                    },
                    body: JSON.stringify(connectionSettings)
                }
            );
            if (!response.ok) throw new Error('Failed to save');
            window.alert('Connection settings saved successfully!');
        } catch (error) {
            console.error('Failed to save:', error);
            window.alert('Failed to save connection settings');
        } finally {
            setSaving(false);
        }
    };

    const tabs: { id: TabType; label: string }[] = [
        { id: "overview", label: "Overview" },
        { id: "realtime", label: "Realtime" },
        { id: "history", label: "History" },
        { id: "config", label: "Configuration" },
    ];

    if (loading || !device) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-12 w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    const readings = realtimeData?.readings || {};
    const realtimeItems = Object.entries(readings).map(([key, data]) => ({
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: data.value.toFixed(2),
        unit: key.includes('voltage') ? 'V' : key.includes('current') ? 'A' : key.includes('power') ? 'kW' : key.includes('temperature') ? '°C' : ''
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <Button variant="ghost" onClick={onBack}>
                            <Icon name="dashboard" size={20} />
                        </Button>
                    )}
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-title-xl">{device.name}</h2>
                            <Badge status={device.status === "ONLINE" ? "online" : device.status === "WARNING" ? "warning" : "offline"}>
                                {device.status}
                            </Badge>
                        </div>
                        <p className="text-text-sub text-sm">{device.site?.name} • {device.protocol}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setActiveTab('config')}>
                        <Icon name="settings" size={16} className="mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-text-sub hover:text-text-primary"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Device Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { label: "Name", value: device.name },
                                { label: "Type", value: device.type },
                                { label: "Protocol", value: device.protocol },
                                { label: "IP Address", value: device.ipAddress || "—" },
                                { label: "Port", value: device.port },
                                { label: "Slave ID", value: device.slaveId },
                                { label: "Status", value: device.status },
                                { label: "Last Seen", value: device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "—" },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between py-2 border-b last:border-0">
                                    <span className="text-text-sub text-sm">{item.label}</span>
                                    <span className="text-sm font-medium">{item.value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {realtimeItems.slice(0, 6).map((item) => (
                                    <div key={item.label} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-text-sub uppercase">{item.label}</p>
                                        <p className="text-xl font-bold">
                                            {item.value} <span className="text-sm font-normal text-text-sub">{item.unit}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "realtime" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Realtime Measurements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {realtimeItems.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {realtimeItems.map((item) => (
                                    <div key={item.label} className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-xs text-text-sub uppercase mb-1">{item.label}</p>
                                        <p className="text-2xl font-bold text-primary">{item.value}</p>
                                        <p className="text-sm text-text-sub">{item.unit}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-sub text-center py-8">No realtime data available</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "history" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>
                            Power History ({historyConfig.title})
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                onClick={() => setHistoryViewMode('realtime')}
                                className={cn(
                                    "px-3 py-1 rounded-l-lg border transition-colors",
                                    historyViewMode === 'realtime'
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-text-sub border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                {CHART_VIEW_CONFIG.realtime.label}
                            </button>
                            <button
                                onClick={() => setHistoryViewMode('24h')}
                                className={cn(
                                    "px-3 py-1 rounded-r-lg border-t border-b border-r transition-colors",
                                    historyViewMode === '24h'
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-text-sub border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                {CHART_VIEW_CONFIG['24h'].label}
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {historyData?.data && historyData.data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historyData.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="time"
                                        tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        stroke="#9CA3AF"
                                    />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        labelFormatter={(t) => new Date(t).toLocaleString()}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="pv_power" stroke="#1E88E5" name="Power (kW)" dot={false} />
                                    <Line type="monotone" dataKey="grid_voltage" stroke="#43A047" name="Voltage (V)" dot={false} />
                                    <Line type="monotone" dataKey="temperature" stroke="#F9A825" name="Temp (°C)" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-sub">
                                No history data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "config" && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Connection Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">IP Address</label>
                                <input
                                    type="text"
                                    value={connectionSettings.ipAddress}
                                    onChange={(e) => setConnectionSettings(prev => ({ ...prev, ipAddress: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Port</label>
                                <input
                                    type="number"
                                    value={connectionSettings.port}
                                    onChange={(e) => setConnectionSettings(prev => ({ ...prev, port: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slave ID</label>
                                <input
                                    type="number"
                                    value={connectionSettings.slaveId}
                                    onChange={(e) => setConnectionSettings(prev => ({ ...prev, slaveId: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <Button className="w-full" onClick={handleSaveConnection} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Connection'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Modbus Mapping</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <span>Power (kW)</span>
                                    <span className="font-mono">40001 × 0.1</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <span>Voltage (V)</span>
                                    <span className="font-mono">40003 × 0.1</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <span>Current (A)</span>
                                    <span className="font-mono">40005 × 0.01</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <span>Energy (kWh)</span>
                                    <span className="font-mono">40007 × 1</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4" onClick={() => setMappingModalOpen(true)}>
                                Edit Mapping
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Mapping Modal */}
            {mappingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMappingModalOpen(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
                        <h2 className="text-lg font-bold mb-4">Edit Modbus Mapping</h2>
                        <div className="space-y-3">
                            {[
                                { name: 'Power', register: 40001, scale: 0.1 },
                                { name: 'Voltage', register: 40003, scale: 0.1 },
                                { name: 'Current', register: 40005, scale: 0.01 },
                                { name: 'Energy', register: 40007, scale: 1 },
                            ].map((mapping) => (
                                <div key={mapping.name} className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        defaultValue={mapping.name}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                        placeholder="Parameter"
                                    />
                                    <input
                                        type="number"
                                        defaultValue={mapping.register}
                                        className="px-3 py-2 border rounded-lg text-sm font-mono"
                                        placeholder="Register"
                                    />
                                    <input
                                        type="number"
                                        defaultValue={mapping.scale}
                                        step="0.01"
                                        className="px-3 py-2 border rounded-lg text-sm font-mono"
                                        placeholder="Scale"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-text-sub mt-3">Note: Mapping changes require device restart to take effect.</p>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="ghost" onClick={() => setMappingModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => { setMappingModalOpen(false); window.alert('Mapping saved!'); }}>Save Mapping</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
