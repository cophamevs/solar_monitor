import React from "react";
import { api, useApi, useInterval, type DashboardSummary, type Site, type PlantStatusCounts, type AlarmSummaryCounts } from "../api";
import { KPICard } from "../components/cards/KPICard";
import { StatusDonut } from "../components/data/StatusDonut";
import { DataTable, type Column } from "../components/data/DataTable";
import { Badge } from "../components/base/Badge";
import { Button } from "../components/base/Button";
import { Icon } from "../components/base/Icon";
import { Skeleton } from "../components/base/Skeleton";

interface SystemOverviewProps {
    onSelectSite?: (siteId: string) => void;
    onNavigateToAlarms?: () => void;
}

export function SystemOverview({ onSelectSite, onNavigateToAlarms }: SystemOverviewProps) {
    const [filter, setFilter] = React.useState("");

    // Fetch dashboard summary
    const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApi<DashboardSummary>(
        () => api.getDashboardSummary(),
        []
    );

    // Fetch sites
    const { data: sites, loading: sitesLoading } = useApi<Site[]>(
        () => api.getSites(),
        []
    );

    // Fetch status distributions
    const { data: plantStatus } = useApi<PlantStatusCounts>(
        () => api.getPlantStatus(),
        []
    );

    const { data: alarmSummary } = useApi<AlarmSummaryCounts>(
        () => api.getAlarmSummary(),
        []
    );

    // Auto-refresh every 30 seconds
    useInterval(() => {
        refetchSummary();
    }, 30000);

    const filteredSites = sites?.filter(s =>
        s.name.toLowerCase().includes(filter.toLowerCase())
    ) || [];

    const plantStatusData = plantStatus ? [
        { name: "Normal", value: plantStatus.normal, color: "#43A047" },
        { name: "Warning", value: plantStatus.warning, color: "#F9A825" },
        { name: "Offline", value: plantStatus.offline, color: "#9E9E9E" },
    ] : [];

    const alarmData = alarmSummary ? [
        { name: "Critical", value: alarmSummary.critical, color: "#E53935" },
        { name: "Major", value: alarmSummary.major, color: "#F9A825" },
        { name: "Minor", value: alarmSummary.minor, color: "#1E88E5" },
        { name: "Warning", value: alarmSummary.warning, color: "#9E9E9E" },
    ] : [];

    const columns: Column<Site>[] = [
        {
            key: "status",
            header: "Status",
            render: (site) => {
                const hasOnline = site.devices?.some(d => d.status === "ONLINE");
                const hasWarning = site.devices?.some(d => d.status === "WARNING" || d.status === "CRITICAL");
                const status = !hasOnline ? "offline" : hasWarning ? "warning" : "online";
                return (
                    <div className={`h-2.5 w-2.5 rounded-full ${status === "online" ? "bg-success" :
                        status === "warning" ? "bg-warning" : "bg-offline"
                        }`} />
                );
            },
            className: "w-16"
        },
        {
            key: "name",
            header: "Plant",
            render: (site) => (
                <button
                    onClick={() => onSelectSite?.(site.id)}
                    className="text-primary hover:underline font-medium"
                >
                    {site.name}
                </button>
            )
        },
        {
            key: "capacity",
            header: "Capacity",
            render: (site) => `${site.capacityKwp} kWp`
        },
        {
            key: "devices",
            header: "Devices",
            render: (site) => site._count?.devices || 0
        },
        {
            key: "alarmCount",
            header: "Alarms",
            render: (site) => (
                (site._count?.alerts || 0) > 0
                    ? <Badge status="critical">{site._count?.alerts}</Badge>
                    : <span className="text-text-sub">—</span>
            )
        },
        {
            key: "action",
            header: "",
            render: (site) => (
                <Button variant="ghost" size="sm" onClick={() => onSelectSite?.(site.id)} title="View Plant">
                    <Icon name="dashboard" size={16} />
                </Button>
            ),
            className: "w-16"
        }
    ];

    if (summaryLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Bar */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <KPICard label="Current Power" value={summary?.currentPower.toFixed(1) || "0"} unit="kW" icon="energy" />
                <KPICard label="Yield Today" value={summary?.yieldToday.toFixed(0) || "0"} unit="kWh" icon="pv" />
                <KPICard label="Total Yield" value={(summary?.totalYield ? (summary.totalYield / 1000).toFixed(1) : "0")} unit="MWh" icon="pv" />
                <KPICard label="Total Plants" value={summary?.totalPlants || 0} icon="plant" />
                <KPICard label="Online Devices" value={summary?.onlineDevices || 0} icon="status-ok" />
                <button onClick={onNavigateToAlarms} className="block">
                    <KPICard label="Alarms" value={summary?.totalAlarms || 0} icon="alarm" />
                </button>
            </div>

            {/* Status Donuts */}
            <div className="grid gap-4 md:grid-cols-2">
                <StatusDonut title="Plant Status" data={plantStatusData} />
                <StatusDonut title="Alarm Summary" data={alarmData} />
            </div>

            {/* Filter Bar */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
                <input
                    type="text"
                    placeholder="Search plants..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
                <select className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option>All Status</option>
                    <option>Online</option>
                    <option>Warning</option>
                    <option>Offline</option>
                </select>
            </div>

            {/* Plant Table */}
            <DataTable
                columns={columns}
                data={filteredSites}
                keyExtractor={(site) => site.id}
                emptyMessage="No plants found"
                loading={sitesLoading}
            />
        </div>
    );
}
