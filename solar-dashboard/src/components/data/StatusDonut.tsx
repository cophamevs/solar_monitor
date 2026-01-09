import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "../cards/Card";
import { Icon } from "../base/Icon";

interface StatusDonutProps {
    title: string;
    data: { name: string; value: number; color: string }[];
    className?: string;
}

export function StatusDonut({ title, data, className }: StatusDonutProps) {
    const total = data.reduce((acc, item) => acc + item.value, 0);

    // Handle empty data
    if (total === 0) {
        return (
            <Card className={className}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{title}</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex flex-col items-center justify-center text-text-sub">
                    <Icon name="status-ok" size={32} className="mb-2 text-gray-300" />
                    <p className="text-sm">No data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(0)}%)`, '']}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-xs">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

