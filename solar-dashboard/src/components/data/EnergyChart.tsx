import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "../cards/Card";

const data = [
    { time: '06:00', generation: 0, consumption: 0.5 },
    { time: '07:00', generation: 0.2, consumption: 0.8 },
    { time: '08:00', generation: 1.5, consumption: 1.2 },
    { time: '09:00', generation: 3.2, consumption: 1.5 },
    { time: '10:00', generation: 4.8, consumption: 1.8 },
    { time: '11:00', generation: 5.5, consumption: 2.1 },
    { time: '12:00', generation: 6.2, consumption: 2.3 },
    { time: '13:00', generation: 6.0, consumption: 2.2 },
    { time: '14:00', generation: 5.8, consumption: 2.0 },
    { time: '15:00', generation: 4.5, consumption: 1.9 },
    { time: '16:00', generation: 3.0, consumption: 1.8 },
    { time: '17:00', generation: 1.2, consumption: 2.5 },
    { time: '18:00', generation: 0.1, consumption: 3.2 },
];

export function EnergyChart() {
    return (
        <Card className="h-[400px]">
            <CardHeader>
                <CardTitle>Energy Overview (Today)</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8} /> {/* Primary Solar Blue */}
                                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E53935" stopOpacity={0.8} /> {/* Critical/Consumption Red */}
                                <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#607D8B', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#607D8B', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            itemStyle={{ color: '#263238' }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Area
                            type="monotone"
                            dataKey="consumption"
                            stroke="#E53935"
                            fillOpacity={1}
                            fill="url(#colorCon)"
                            name="Consumption (kW)"
                        />
                        <Area
                            type="monotone"
                            dataKey="generation"
                            stroke="#1E88E5"
                            fillOpacity={1}
                            fill="url(#colorGen)"
                            name="Solar Generation (kW)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
