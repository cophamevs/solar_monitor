import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/cards/Card";
import { Button } from "../../components/base/Button";
import { Icon } from "../../components/base/Icon";
import { Badge } from "../../components/base/Badge";

interface BackupItemProps {
    name: string;
    date: string;
    size: string;
    type: "manual" | "auto";
}

function BackupItem({ name, date, size, type }: BackupItemProps) {
    const [restoring, setRestoring] = React.useState(false);

    const handleRestore = async () => {
        if (!window.confirm(`Restore from ${name}? This will overwrite current data.`)) return;
        setRestoring(true);
        try {
            // Simulate restore API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.alert(`Successfully restored from ${name}`);
        } catch (error) {
            window.alert('Restore failed. Please try again.');
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="flex items-center space-x-3">
                <Icon name="report" size={20} className="text-text-sub" />
                <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-text-sub">{date} • {size}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Badge status={type === "auto" ? "online" : "warning"}>{type}</Badge>
                <Button variant="ghost" size="sm" onClick={handleRestore} disabled={restoring}>
                    {restoring ? 'Restoring...' : 'Restore'}
                </Button>
            </div>
        </div>
    );
}

export function Backup() {
    const [isBackingUp, setIsBackingUp] = React.useState(false);
    const [autoBackupEnabled, setAutoBackupEnabled] = React.useState(true);

    const backups = [
        { name: "backup_2026-01-05.tar.gz", date: "Jan 5, 2026 06:00 AM", size: "1.2 GB", type: "auto" as const },
        { name: "backup_2026-01-04.tar.gz", date: "Jan 4, 2026 06:00 AM", size: "1.1 GB", type: "auto" as const },
        { name: "backup_manual_2026-01-03.tar.gz", date: "Jan 3, 2026 02:15 PM", size: "1.1 GB", type: "manual" as const },
    ];

    const handleBackup = async () => {
        setIsBackingUp(true);
        // Simulate backup
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsBackingUp(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-title-xl mb-2">Backup & Restore</h2>
                <p className="text-text-sub">Manage system backups and restore points</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Manual Backup */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manual Backup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-text-sub">
                            Create a backup of all configuration and data files.
                        </p>
                        <Button onClick={handleBackup} loading={isBackingUp} className="w-full">
                            {isBackingUp ? "Creating Backup..." : "Create Backup Now"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Auto Backup Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle>Auto Backup Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Enable Auto Backup</span>
                            <button
                                onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoBackupEnabled ? "bg-primary" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoBackupEnabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Schedule</label>
                            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option>Daily at 6:00 AM</option>
                                <option>Every 12 hours</option>
                                <option>Weekly on Sunday</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Keep last</label>
                            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                <option>7 backups</option>
                                <option>14 backups</option>
                                <option>30 backups</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Backup History */}
            <Card>
                <CardHeader>
                    <CardTitle>Backup History</CardTitle>
                </CardHeader>
                <CardContent>
                    {backups.map((backup) => (
                        <BackupItem key={backup.name} {...backup} />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
