import { useEffect, useState } from 'react';
import { dashboardService, type DashboardSummary } from '../services/dashboardService';
import { useSocket } from './useSocket';

export const useSystemSummary = () => {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dashboardService.getSummary();
                setData(result);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        if (socket) {
            socket.on('dashboard_update', (newData: DashboardSummary) => {
                setData(newData);
            });
        }

        return () => {
            if (socket) {
                socket.off('dashboard_update');
            }
        };
    }, [socket]);

    return {
        totalPower: data?.currentPower || 0,
        totalEnergy: data?.yieldToday || 0,
        currentPower: data?.currentPower || 0,
        activeDevices: data?.onlineDevices || 0,
        totalDevices: data?.totalDevices || 0,
        onlinePlants: data?.onlinePlants || 0,
        totalPlants: data?.totalPlants || 0,
        totalAlarms: data?.totalAlarms || 0,
        loading,
        error
    };
};
