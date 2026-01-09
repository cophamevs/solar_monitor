import { Card, CardHeader, CardTitle, CardContent } from "../../components/cards/Card";
import { Icon } from "../../components/base/Icon";
import { Badge } from "../../components/base/Badge";
import { cn } from "../../utils/cn";

interface HealthMetricProps {
    label: string;
    value: number;
    unit: string;
    max: number;
    status: "ok" | "warning" | "critical";
}

function HealthMetric({ label, value, max, unit, status }: HealthMetricProps) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={cn(
                    "font-semibold",
                    status === "ok" && "text-success",
                    status === "warning" && "text-warning",
                    status === "critical" && "text-critical"
                )}>
                    {value} {unit}
                </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all",
                        status === "ok" && "bg-success",
                        status === "warning" && "bg-warning",
                        status === "critical" && "bg-critical"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-text-sub">{percentage.toFixed(0)}% of {max} {unit}</p>
        </div>
    );
}

interface ServiceStatusProps {
    name: string;
    status: "running" | "stopped" | "error";
    uptime?: string;
}

function ServiceStatus({ name, status, uptime }: ServiceStatusProps) {
    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="flex items-center space-x-3">
                <div className={cn(
                    "h-2 w-2 rounded-full",
                    status === "running" && "bg-success",
                    status === "stopped" && "bg-offline",
                    status === "error" && "bg-critical"
                )} />
                <span className="font-medium text-sm">{name}</span>
            </div>
            <div className="flex items-center space-x-3">
                {uptime && <span className="text-xs text-text-sub">Uptime: {uptime}</span>}
                <Badge status={status === "running" ? "online" : status === "error" ? "critical" : "offline"}>
                    {status}
                </Badge>
            </div>
        </div>
    );
}

export function SystemHealth() {
    // Mock data - in real app this would come from API
    const metrics = {
        cpu: { value: 23, max: 100, status: "ok" as const },
        ram: { value: 1.2, max: 4, status: "ok" as const },
        disk: { value: 12, max: 32, status: "ok" as const },
    };

    const services = [
        { name: "Solar Monitor API", status: "running" as const, uptime: "5d 12h" },
        { name: "MQTT Broker", status: "running" as const, uptime: "5d 12h" },
        { name: "Data Collector", status: "running" as const, uptime: "2d 8h" },
        { name: "Backup Service", status: "stopped" as const },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-title-xl mb-2">System Health</h2>
                <p className="text-text-sub">Monitor system resources and service status</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Resource Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Icon name="device" size={20} />
                            <span>Resource Usage</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <HealthMetric label="CPU Usage" value={metrics.cpu.value} max={metrics.cpu.max} unit="%" status={metrics.cpu.status} />
                        <HealthMetric label="RAM Usage" value={metrics.ram.value} max={metrics.ram.max} unit="GB" status={metrics.ram.status} />
                        <HealthMetric label="Disk Usage" value={metrics.disk.value} max={metrics.disk.max} unit="GB" status={metrics.disk.status} />
                    </CardContent>
                </Card>

                {/* Service Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Icon name="settings" size={20} />
                            <span>Services</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {services.map((service) => (
                            <ServiceStatus key={service.name} {...service} />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
