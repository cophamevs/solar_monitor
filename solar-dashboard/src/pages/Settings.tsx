import React from "react";
import { Icon, type IconName } from "../components/base/Icon";
import { cn } from "../utils/cn";
import { SystemHealth } from "./settings/SystemHealth";
import { Backup } from "./settings/Backup";
import { DataRetention } from "./settings/DataRetention";

type SettingsTab = "health" | "backup" | "retention";

interface SettingsNavItemProps {
    icon: IconName;
    label: string;
    description: string;
    active?: boolean;
    onClick?: () => void;
}

function SettingsNavItem({ icon, label, description, active, onClick }: SettingsNavItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 rounded-lg border transition-colors",
                active
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-gray-50"
            )}
        >
            <div className="flex items-start space-x-3">
                <Icon
                    name={icon}
                    size={20}
                    className={active ? "text-primary" : "text-text-sub"}
                />
                <div>
                    <p className={cn("font-medium text-sm", active && "text-primary")}>{label}</p>
                    <p className="text-xs text-text-sub mt-0.5">{description}</p>
                </div>
            </div>
        </button>
    );
}

export function Settings() {
    const [activeTab, setActiveTab] = React.useState<SettingsTab>("health");

    const tabs: { id: SettingsTab; icon: IconName; label: string; description: string }[] = [
        { id: "health", icon: "device", label: "System Health", description: "CPU, RAM, Disk, Services" },
        { id: "backup", icon: "report", label: "Backup & Restore", description: "Manage backups" },
        { id: "retention", icon: "settings", label: "Data Retention", description: "Storage settings" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "health": return <SystemHealth />;
            case "backup": return <Backup />;
            case "retention": return <DataRetention />;
            default: return <SystemHealth />;
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-4">
            {/* Settings Navigation */}
            <div className="lg:col-span-1 space-y-2">
                {tabs.map((tab) => (
                    <SettingsNavItem
                        key={tab.id}
                        icon={tab.icon}
                        label={tab.label}
                        description={tab.description}
                        active={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
                {renderContent()}
            </div>
        </div>
    );
}
