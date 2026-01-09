import React from "react";
import { api, useApi, useInterval, type Site, type Device, type Alert, type EnergyFlowData } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/cards/Card";
import { KPICard } from "../components/cards/KPICard";
import { Badge } from "../components/base/Badge";
import { Button } from "../components/base/Button";
import { Icon } from "../components/base/Icon";
import { Skeleton } from "../components/base/Skeleton";
import { EnergyFlowDiagram } from "../components/energy/EnergyFlowDiagram";
import { EnergyImpact } from "../components/energy/EnergyImpact";
import { DataTable, type Column } from "../components/data/DataTable";

interface PlantOverviewProps {
    siteId?: string;
    onSelectDevice?: (deviceId: string) => void;
    onBack?: () => void;
}

export function PlantOverview({ siteId, onSelectDevice, onBack }: PlantOverviewProps) {
    // Fetch sites list if no siteId provided
    const { data: sites, loading: sitesLoading } = useApi<Site[]>(
        () => api.getSites(),
        []
    );

    // Use first site if no siteId
    const activeSiteId = siteId || sites?.[0]?.id;
    const [selectedSiteId, setSelectedSiteId] = React.useState<string | undefined>(activeSiteId);

    React.useEffect(() => {
        if (activeSiteId && !selectedSiteId) {
            setSelectedSiteId(activeSiteId);
        }
    }, [activeSiteId, selectedSiteId]);

    // Fetch site details
    const { data: site, loading: siteLoading, refetch } = useApi<Site>(
        () => selectedSiteId ? api.getSite(selectedSiteId) : Promise.resolve(null as unknown as Site),
        [selectedSiteId]
    );

    // Fetch devices for this site
    const { data: devices } = useApi<Device[]>(
        () => selectedSiteId ? api.getSiteDevices(selectedSiteId) : Promise.resolve([]),
        [selectedSiteId]
    );

    // Fetch real-time energy flow data
    const { data: flowData, refetch: refetchFlow } = useApi<EnergyFlowData>(
        () => selectedSiteId ? api.getEnergyFlow(selectedSiteId) : Promise.resolve({ pv: 0, grid: 0, load: 0, battery: 0, soc: 0, totalYield: 0 }),
        [selectedSiteId]
    );

    // Auto-refresh site data and energy flow
    useInterval(() => {
        refetch();
        refetchFlow();
    }, 10000); // 10 seconds for real-time feel

    const deviceColumns: Column<Device>[] = [
        {
            key: "status",
            header: "Status",
            render: (device) => (
                <div className={`h-3 w-3 rounded-full ${device.status === "ONLINE" ? "bg-success" :
                    device.status === "WARNING" ? "bg-warning" :
                        device.status === "CRITICAL" ? "bg-critical" : "bg-offline"
                    }`} />
            ),
            className: "w-12"
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
        }
    ];

    if (sitesLoading || siteLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <Skeleton className="h-80 rounded-xl" />
            </div>
        );
    }

    if (!site && !sites?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-text-sub">
                <Icon name="plant" size={48} className="mb-4 text-gray-300" />
                <p>No plants available</p>
            </div>
        );
    }

    const openAlerts = site?.alerts?.filter(a => a.status === 'OPEN') || [];
    const criticalAlerts = openAlerts.filter(a => a.level === 'CRITICAL').length;
    const warningAlerts = openAlerts.filter(a => a.level === 'WARNING' || a.level === 'MAJOR').length;

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
                        <div className="flex items-center space-x-3">
                            <h2 className="text-title-xl">{site?.name || "Plant Overview"}</h2>
                            {sites && sites.length > 1 && (
                                <select
                                    value={selectedSiteId}
                                    onChange={(e) => setSelectedSiteId(e.target.value)}
                                    className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:border-primary"
                                >
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <p className="text-text-sub text-sm">{site?.location} • {site?.capacityKwp} kWp</p>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard label="Capacity" value={site?.capacityKwp || 0} unit="kWp" icon="pv" />
                <KPICard label="Devices" value={devices?.length || 0} icon="device" />
                <KPICard
                    label="Online"
                    value={devices?.filter(d => d.status === "ONLINE").length || 0}
                    icon="status-ok"
                />
                <KPICard
                    label="Alarms"
                    value={site?._count?.alerts || 0}
                    icon="alarm"
                />
            </div>

            {/* Energy Flow + Alarm Summary */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Energy Flow Diagram */}
                {/* Energy Flow Diagram */}
                <div className="lg:col-span-2">
                    <EnergyFlowDiagram data={flowData ?? undefined} />
                </div>

                {/* Alarm Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Alarm Summary</span>
                            {openAlerts.length > 0 && (
                                <Badge status="critical">{openAlerts.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-critical/10 p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-critical">{criticalAlerts}</p>
                                <p className="text-xs text-text-sub">Critical</p>
                            </div>
                            <div className="bg-warning/10 p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-warning">{warningAlerts}</p>
                                <p className="text-xs text-text-sub">Warning</p>
                            </div>
                        </div>

                        {openAlerts.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {openAlerts.slice(0, 5).map((alert: Alert) => (
                                    <div key={alert.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                                        <div className={`h-2 w-2 rounded-full mt-1.5 ${alert.level === "CRITICAL" ? "bg-critical" : "bg-warning"
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{alert.message}</p>
                                            <p className="text-xs text-text-sub">{alert.device?.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-text-sub">
                                <Icon name="status-ok" size={32} className="mx-auto mb-2 text-success" />
                                <p className="text-sm">No active alarms</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Environmental Impact */}
            <EnergyImpact totalYieldKwh={flowData?.totalYield ?? 0} />

            {/* Device List */}
            <Card>
                <CardHeader>
                    <CardTitle>Devices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={deviceColumns}
                        data={devices || []}
                        keyExtractor={(device) => device.id}
                        emptyMessage="No devices in this plant"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
