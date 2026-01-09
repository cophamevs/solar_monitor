import { Icon, type IconName } from "../base/Icon";
import { cn } from "../../utils/cn";

interface SidebarItemProps {
    icon: IconName;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                {
                    "bg-primary/10 text-primary": active,
                    "text-text-sub hover:bg-gray-100 hover:text-text-primary": !active,
                }
            )}
        >
            <Icon name={icon} size={20} className={active ? "text-primary" : "text-text-sub"} />
            <span>{label}</span>
        </button>
    );
}

export interface AppShellProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (id: string) => void;
    onLogout?: () => void;
}

export function AppShell({ children, activeTab, onTabChange, onLogout }: AppShellProps) {
    const navItems: { id: string; label: string; icon: IconName }[] = [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "plants", label: "Plants", icon: "plant" },
        { id: "devices", label: "Devices", icon: "device" },
        { id: "alarms", label: "Alarms", icon: "alarm" },
        { id: "analytics", label: "Analytics", icon: "analytics" },
        { id: "reports", label: "Reports", icon: "report" },
        { id: "settings", label: "Settings", icon: "settings" },
    ];

    return (
        <div className="flex h-screen w-full bg-background text-text-primary">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-white md:flex">
                <div className="flex h-16 items-center px-6 border-b">
                    <div className="flex items-center space-x-2 text-primary">
                        <Icon name="pv" size={28} />
                        <span className="text-xl font-bold tracking-tight">SolarMonitor</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() => onTabChange(item.id)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center justify-between space-x-3 rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                A
                            </div>
                            <div>
                                <p className="text-sm font-medium">Admin User</p>
                                <p className="text-xs text-text-sub">admin@solar.com</p>
                            </div>
                        </div>
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="p-2 text-text-sub hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                title="Logout"
                            >
                                <Icon name="settings" size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                {/* Top Header */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                    <h1 className="text-title-l">
                        {navItems.find(i => i.id === activeTab)?.label}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-text-sub">Last updated: Just now</div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
