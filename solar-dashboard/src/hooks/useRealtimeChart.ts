import { useEffect, useState, useRef } from 'react';
import { deviceService } from '../services/deviceService';
import { useSocket } from './useSocket';

interface ChartPoint {
    time: string;
    power: number;
    load: number;
}

export const useRealtimeChart = (deviceId?: string) => {
    const [series, setSeries] = useState<ChartPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();
    const seriesRef = useRef<ChartPoint[]>([]);

    useEffect(() => {
        if (!deviceId) return;

        const fetchInitial = async () => {
            try {
                const endDate = new Date();
                const startDate = new Date(endDate.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago

                const data = await deviceService.getTelemetry(deviceId, {
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    interval: 'raw' // Get raw data points
                });

                const history = (data.data || []).map((point: any) => ({
                    time: point.time,
                    power: point.pv_power || point.power || 0,
                    load: point.load_power || point.load || 0
                }));

                // Take last 50 points to match potential chart limit
                const initialSeries = history.slice(-50);

                setSeries(initialSeries);
                seriesRef.current = initialSeries;
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitial();

        if (socket) {
            socket.emit('subscribe_device', deviceId);

            socket.on('telemetry_update', (payload: any) => {
                if (payload.deviceId === deviceId) {
                    const newPoint: ChartPoint = {
                        time: new Date().toISOString(),
                        power: payload.data.pv_power || payload.data.power || 0,
                        load: payload.data.load_power || payload.data.load || 0
                    };

                    seriesRef.current = [...seriesRef.current, newPoint].slice(-50); // Keep last 50 points
                    setSeries(seriesRef.current);
                }
            });
        }

        return () => {
            if (socket) {
                socket.emit('unsubscribe_device', deviceId);
                socket.off('telemetry_update');
            }
        };
    }, [deviceId, socket]);

    return { series, loading };
};
