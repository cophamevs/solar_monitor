import React from "react";
import { message } from "antd";
import { api, useApi, useInterval, type Alert, type AlertsResponse } from "../api";
import { Card, CardContent } from "../components/cards/Card";
import { Button } from "../components/base/Button";
import { Icon } from "../components/base/Icon";
import { Badge, type StatusType } from "../components/base/Badge";
import { DataTable, type Column } from "../components/data/DataTable";
import { Skeleton } from "../components/base/Skeleton";
import { exportToCSV } from "../utils/exportUtils";

type AlarmLevel = "CRITICAL" | "MAJOR" | "MINOR" | "WARNING";

export function Alarms() {
    const [filterLevel, setFilterLevel] = React.useState<string>("all");
    const [filterStatus, setFilterStatus] = React.useState<string>("all");

    const [commentModal, setCommentModal] = React.useState<{ isOpen: boolean; alertId: string; message: string }>(
        { isOpen: false, alertId: "", message: "" }
    );
    const [commentText, setCommentText] = React.useState("");
    const [commentLoading, setCommentLoading] = React.useState(false);

    const { data: alertsResponse, loading, refetch } = useApi<AlertsResponse>(
        () => api.getAlerts({
            level: filterLevel !== "all" ? filterLevel : undefined,
            status: filterStatus !== "all" ? filterStatus : undefined,
        }),
        [filterLevel, filterStatus]
    );

    // Auto-refresh
    useInterval(() => refetch(), 30000);

    const alerts = alertsResponse?.data || [];

    const levelColors: Record<AlarmLevel, StatusType> = {
        CRITICAL: "critical",
        MAJOR: "warning",
        MINOR: "online",
        WARNING: "offline"
    };

    const handleAcknowledge = async (alertId: string) => {
        try {
            await api.acknowledgeAlert(alertId);
            refetch();
            // Show brief success indication
            console.log('Alert acknowledged successfully');
        } catch (error) {
            console.error("Failed to acknowledge alert:", error);
            window.alert('Failed to acknowledge alert');
        }
    };

    const handleExportCSV = async () => {
        try {
            // Refetch latest data before export to ensure comments are included
            const response = await api.getAlerts({ limit: 100 });
            const freshAlerts = response?.data || alerts;

            const data = freshAlerts.map(a => ({
                Time: new Date(a.createdAt).toLocaleString(),
                Plant: a.site?.name || "-",
                Device: a.device?.name || "-",
                Level: a.level,
                Message: a.message,
                Status: a.status,
                Comment: a.comment || "-"
            }));
            exportToCSV(data, `alarm_log_${new Date().toISOString().split('T')[0]}`);
            message.success("Alarm log exported successfully");
        } catch (error) {
            message.error((error as Error).message || "Failed to export alarm log");
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        setCommentLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "/api"}/alerts/${commentModal.alertId}/comment`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` })
                    },
                    body: JSON.stringify({ comment: commentText })
                }
            );
            if (!response.ok) {
                throw new Error('Failed to save comment');
            }
            setCommentModal({ isOpen: false, alertId: "", message: "" });
            setCommentText("");
            refetch();
        } catch (error) {
            console.error("Failed to add comment:", error);
            window.alert('Failed to save comment. Please try again.');
        } finally {
            setCommentLoading(false);
        }
    };

    const columns: Column<Alert>[] = [
        {
            key: "time",
            header: "Time",
            render: (alert) => (
                <span className="text-sm text-text-sub">
                    {new Date(alert.createdAt).toLocaleString()}
                </span>
            )
        },
        {
            key: "plant",
            header: "Plant",
            render: (alert) => <span className="font-medium">{alert.site?.name || "—"}</span>
        },
        {
            key: "device",
            header: "Device",
            render: (alert) => alert.device?.name || "—"
        },
        {
            key: "level",
            header: "Level",
            render: (alert) => (
                <Badge status={levelColors[alert.level]} className="uppercase text-xs">
                    {alert.level}
                </Badge>
            )
        },
        {
            key: "message",
            header: "Message",
            render: (alert) => <span className="text-sm">{alert.message}</span>
        },
        {
            key: "status",
            header: "Status",
            render: (alert) => (
                <span className={`text-xs font-medium uppercase ${alert.status === "OPEN" ? "text-critical" :
                    alert.status === "ACKNOWLEDGED" ? "text-warning" : "text-success"
                    }`}>
                    {alert.status}
                </span>
            )
        },
        {
            key: "actions",
            header: "Actions",
            render: (alert) => (
                <div className="flex space-x-1">
                    {alert.status === "OPEN" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            title="Acknowledge"
                            onClick={() => handleAcknowledge(alert.id)}
                        >
                            <Icon name="status-ok" size={16} />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Add Comment"
                        onClick={() => setCommentModal({ isOpen: true, alertId: alert.id, message: alert.message })}
                    >
                        <Icon name="report" size={16} />
                    </Button>
                </div>
            )
        }
    ];

    const openCount = alerts.filter(a => a.status === "OPEN").length;
    const criticalCount = alerts.filter(a => a.level === "CRITICAL" && a.status === "OPEN").length;

    if (loading && !alertsResponse) {
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
                    <h2 className="text-title-xl">Alarm Management</h2>
                    <p className="text-text-sub text-sm mt-1">
                        {openCount} open alarms • {criticalCount} critical
                    </p>
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                    <Icon name="report" size={16} className="mr-2" />
                    Export Log
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-4">
                <Card className="border-l-4 border-l-critical">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Critical</p>
                            <p className="text-2xl font-bold text-critical">
                                {alerts.filter(a => a.level === "CRITICAL").length}
                            </p>
                        </div>
                        <Icon name="status-critical" className="text-critical" />
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-warning">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Major</p>
                            <p className="text-2xl font-bold text-warning">
                                {alerts.filter(a => a.level === "MAJOR").length}
                            </p>
                        </div>
                        <Icon name="status-warning" className="text-warning" />
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Minor</p>
                            <p className="text-2xl font-bold text-primary">
                                {alerts.filter(a => a.level === "MINOR").length}
                            </p>
                        </div>
                        <Icon name="alarm" className="text-primary" />
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-offline">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-sub uppercase">Warning</p>
                            <p className="text-2xl font-bold text-offline">
                                {alerts.filter(a => a.level === "WARNING").length}
                            </p>
                        </div>
                        <Icon name="alarm" className="text-offline" />
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
                <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                    <option value="all">All Levels</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="MAJOR">Major</option>
                    <option value="MINOR">Minor</option>
                    <option value="WARNING">Warning</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                    <option value="all">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
            </div>

            {/* Alarm Table */}
            <DataTable
                columns={columns}
                data={alerts}
                keyExtractor={(alert) => alert.id}
                emptyMessage="No alarms found"
            />

            {/* Comment Modal */}
            {commentModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setCommentModal({ isOpen: false, alertId: "", message: "" })} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <h2 className="text-lg font-bold mb-2">Add Comment</h2>
                        <p className="text-sm text-text-sub mb-4">Alarm: {commentModal.message}</p>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Enter your comment..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px]"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="ghost" onClick={() => setCommentModal({ isOpen: false, alertId: "", message: "" })}>Cancel</Button>
                            <Button onClick={handleAddComment} disabled={commentLoading || !commentText.trim()}>
                                {commentLoading ? "Saving..." : "Save Comment"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
