import {
    AlertTriangle,
    Activity,
    Zap,
    Server,
    LayoutDashboard,
    Factory,
    FileText,
    Settings,
    Sun,
    Battery,
    Plug,
    Home,
    CheckCircle,

    AlertOctagon,
    WifiOff
} from "lucide-react";
import { cn } from "../../utils/cn";

export type IconName =
    | "dashboard" | "plant" | "device" | "alarm" | "report" | "settings" | "analytics"
    | "energy" | "pv" | "load" | "grid" | "battery"
    | "status-ok" | "status-warning" | "status-critical" | "status-offline";

const iconMap: Record<IconName, React.ElementType> = {
    dashboard: LayoutDashboard,
    plant: Factory,
    device: Server,
    alarm: AlertTriangle,
    report: FileText,
    settings: Settings,
    energy: Zap,
    pv: Sun,
    load: Home,
    grid: Plug,
    battery: Battery,
    "status-ok": CheckCircle,
    "status-warning": AlertTriangle,
    "status-critical": AlertOctagon,
    "status-offline": WifiOff,
    analytics: Activity
};

interface IconProps extends React.HTMLAttributes<SVGElement> {
    name: IconName;
    size?: number | string;
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
    const LucideIcon = iconMap[name] || Activity;
    return <LucideIcon size={size} className={cn("inline-block", className)} {...props} />;
}
