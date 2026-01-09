import React from "react";
import { api, useApi, type AnalyticsCompareResponse, type AnalyticsSiteData } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/cards/Card";
import { Skeleton } from "../components/base/Skeleton";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

export function Analytics() {
    const [timeRange, setTimeRange] = React.useState<'day' | 'month' | 'year'>('day');

    const { data, loading } = useApi<AnalyticsCompareResponse>(
        () => api.getAnalyticsCompare(timeRange),
        [timeRange]
    );

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-[300px] w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[300px]" />
                    <Skeleton className="h-[300px]" />
                </div>
                <Skeleton className="h-[200px]" />
            </div>
        );
    }

    const sites = data?.sites || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-title-xl">Plant Analytics</h2>
                    <p className="text-text-sub text-sm mt-1">Compare performance and health across sites</p>
                </div>
                <div className="flex bg-white rounded-lg border p-1">
                    {(['day', 'month', 'year'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === r ? "bg-primary text-white" : "hover:bg-gray-50 text-text-sub"
                                }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Row 1: Specific Yield Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>Specific Yield Comparison (kWh/kWp)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sites} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="specificYield" name="Specific Yield" fill="#43A047" radius={[0, 4, 4, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Row 2: Production & Issues */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Production Share */}
                <Card>
                    <CardHeader>
                        <CardTitle>Production Share</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sites}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="productionShare"
                                >
                                    {sites.map((_entry: AnalyticsSiteData, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Error Counts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Critical Alerts Density</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sites}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="criticalAlerts" name="Critical Alerts" fill="#E53935" barSize={48} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Downtime & Availability Table */}
            <Card>
                <CardHeader>
                    <CardTitle>System Availability & Downtime</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-text-sub uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Site Name</th>
                                    <th className="px-6 py-3">Capacity</th>
                                    <th className="px-6 py-3">Total Production</th>
                                    <th className="px-6 py-3">Downtime</th>
                                    <th className="px-6 py-3">Availability</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sites.map((site: AnalyticsSiteData) => (
                                    <tr key={site.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{site.name}</td>
                                        <td className="px-6 py-4">{site.capacityKwp} kWp</td>
                                        <td className="px-6 py-4">{site.production.toFixed(1)} kWh</td>
                                        <td className="px-6 py-4 text-text-sub">{site.downtimeHours.toFixed(2)} hrs</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${site.availability >= 98 ? 'bg-success/10 text-success' : 'bg-critical/10 text-critical'
                                                }`}>
                                                {site.availability.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
