import React from "react";
import { api, useApi, type Device } from "../api";
import { Card, CardContent } from "../components/cards/Card";
import { Button } from "../components/base/Button";
import { Badge } from "../components/base/Badge";
import { Icon } from "../components/base/Icon";
import { DataTable, type Column } from "../components/data/DataTable";
import { Skeleton } from "../components/base/Skeleton";
import { AddDeviceModal } from "../components/device/AddDeviceModal";

interface DeviceListProps {
    onSelectDevice?: (deviceId: string) => void;
}

export function DeviceList({ onSelectDevice }: DeviceListProps) {
    const [filter, setFilter] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState<string>("all");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [refreshKey, setRefreshKey] = React.useState(0);

    const { data: devices, loading } = useApi<Device[]>(
        () => api.getDevices(),
        [refreshKey]
    );

    const { data: sites } = useApi<{ id: string; name: string }[]>(
        () => fetch(`${import.meta.env.VITE_API_URL || "/api"}/sites`)
            .then(res => res.json())
            .then(data => data.map((s: any) => ({ id: s.id, name: s.name }))),
        []
    );

    const handleDeviceAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    const filteredDevices = (devices || []).filter(d => {
        if (filter && !d.name.toLowerCase().includes(filter.toLowerCase())) return false;
        if (typeFilter !== "all" && d.type !== typeFilter) return false;
        return true;
    });

    const columns: Column<Device>[] = [
        {
            key: "status",
            header: "Status",
            render: (device) => (
                <div className={`h-3 w-3 rounded-full ${device.status === "ONLINE" ? "bg-success" :
                    device.status === "WARNING" ? "bg-warning" :
                        device.status === "CRITICAL" ? "bg-critical" : "bg-offline"
                    }`} />
            ),
            className: "w-16"
        },
        {
            key: "name",
            header: "Device",
            render: (device) => (
                <button
                    onClick={() => onSelectDevice?.(device.id)}
                    className="text-primary hover:underline font-medium"
                >
                    {device.name}
                </button>
            )
        },
        {
            key: "site",
            header: "Plant",
            render: (device) => device.site?.name || "—"
        },
        {
            key: "type",
            header: "Type",
            render: (device) => (
                <Badge status={device.type === "INVERTER" ? "online" : device.type === "METER" ? "warning" : "offline"}>
                    {device.type}
                </Badge>
            )
        },
        {
            key: "protocol",
            header: "Protocol",
            render: (device) => <span className="text-sm font-mono">{device.protocol}</span>
        },
        {
            key: "lastSeen",
            header: "Last Seen",
            render: (device) => (
                <span className="text-sm text-text-sub">
                    {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : "—"}
                </span>
            )
        },
        {
            key: "alarmCount",
            header: "Alarms",
            render: (device) => (
                (device._count?.alerts || 0) > 0
                    ? <Badge status="critical">{device._count?.alerts}</Badge>
                    : <span className="text-text-sub">—</span>
            )
        },
        {
            key: "action",
            header: "",
            render: (device) => (
                <Button variant="ghost" size="sm" onClick={() => onSelectDevice?.(device.id)}>
                    <Icon name="dashboard" size={16} />
                </Button>
            ),
            className: "w-16"
        }
    ];

    const onlineCount = devices?.filter(d => d.status === "ONLINE").length || 0;
    const warningCount = devices?.filter(d => d.status === "WARNING").length || 0;
    const offlineCount = devices?.filter(d => d.status === "OFFLINE").length || 0;

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-title-xl">Device Management</h2>
                    <p className="text-text-sub text-sm mt-1">
                        {devices?.length || 0} devices • {onlineCount} online • {warningCount} warning • {offlineCount} offline
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Icon name="device" size={16} className="mr-2" />
                    Add Device
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Inverters</p>
                            <p className="text-xl font-bold">{devices?.filter(d => d.type === "INVERTER").length || 0}</p>
                        </div>
                        <Icon name="device" className="text-primary" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Meters</p>
                            <p className="text-xl font-bold">{devices?.filter(d => d.type === "METER").length || 0}</p>
                        </div>
                        <Icon name="grid" className="text-warning" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Sensors</p>
                            <p className="text-xl font-bold">{devices?.filter(d => d.type === "SENSOR").length || 0}</p>
                        </div>
                        <Icon name="pv" className="text-success" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Online</p>
                            <p className="text-xl font-bold text-success">{onlineCount}</p>
                        </div>
                        <Icon name="status-ok" className="text-success" />
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
                <input
                    type="text"
                    placeholder="Search devices..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                    <option value="all">All Types</option>
                    <option value="INVERTER">Inverters</option>
                    <option value="METER">Meters</option>
                    <option value="SENSOR">Sensors</option>
                </select>
            </div>

            {/* Device Table */}
            <DataTable
                columns={columns}
                data={filteredDevices}
                keyExtractor={(device) => device.id}
                emptyMessage="No devices found"
            />

            {/* Add Device Modal */}
            <AddDeviceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleDeviceAdded}
                sites={sites || []}
            />
        </div>
    );
}
