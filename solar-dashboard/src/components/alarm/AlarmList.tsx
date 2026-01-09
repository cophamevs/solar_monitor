import { Card, CardHeader, CardTitle, CardContent } from "../cards/Card";
import { Badge, type StatusType } from "../base/Badge";
import { Icon } from "../base/Icon";

export interface AlarmItemProps {
    id: string;
    severity: "critical" | "warning" | "minor";
    message: string;
    timestamp: string;
    device: string;
}

function AlarmItem({ severity, message, timestamp, device }: AlarmItemProps) {
    const badgeStatus: StatusType = severity === "critical" ? "critical" : severity === "warning" ? "warning" : "online"; // minor -> online/info

    return (
        <div className="flex items-start justify-between border-b py-3 last:border-0">
            <div className="flex items-start space-x-3">
                <div className="mt-1">
                    <Badge status={badgeStatus} className="uppercase">{severity}</Badge>
                </div>
                <div>
                    <p className="text-sm font-medium text-text-primary">{message}</p>
                    <div className="flex items-center space-x-2 text-xs text-text-sub mt-1">
                        <span className="flex items-center">
                            <Icon name="device" size={12} className="mr-1" />
                            {device}
                        </span>
                        <span>•</span>
                        <span>{timestamp}</span>
                    </div>
                </div>
            </div>
            <button className="text-text-sub hover:text-primary">
                <Icon name="status-ok" size={16} />
            </button>
        </div>
    );
}

export function AlarmList({ alarms }: { alarms: AlarmItemProps[] }) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Alarms</CardTitle>
                <Badge status="critical">{alarms.length} Issues</Badge>
            </CardHeader>
            <CardContent>
                {alarms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-text-sub">
                        <Icon name="status-ok" size={32} className="mb-2 text-success" />
                        <p>System Healthy</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {alarms.map((alarm) => (
                            <AlarmItem key={alarm.id} {...alarm} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
