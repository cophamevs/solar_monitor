import { Card, CardContent } from "./Card";
import { Icon, type IconName } from "../base/Icon";
import { cn } from "../../utils/cn";

interface KPICardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon?: IconName;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function KPICard({ label, value, unit, icon, trend, className }: KPICardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-text-sub">{label}</span>
                    {icon && <Icon name={icon} className="h-4 w-4 text-text-sub" />}
                </div>
                <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-text-primary">{value}</span>
                    {unit && <span className="text-sm font-medium text-text-sub">{unit}</span>}
                </div>
                {trend && (
                    <div className={cn("text-xs mt-1", trend.isPositive ? "text-success" : "text-critical")}>
                        {trend.isPositive ? "+" : ""}{trend.value}% from last period
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
