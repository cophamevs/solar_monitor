import { useEffect, useState } from 'react';
import { deviceService, type Device } from '../services/deviceService';
import { useSocket } from './useSocket';

export const useDeviceList = (filters?: { siteId?: string; type?: string }) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const result = await deviceService.list(filters);
                setDevices(result);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();

        if (socket) {
            socket.on('device_status', (payload: { deviceId: string; status: Device['status'] }) => {
                setDevices((prev) =>
                    prev.map(d => d.id === payload.deviceId ? { ...d, status: payload.status } : d)
                );
            });
        }

        return () => {
            if (socket) {
                socket.off('device_status');
            }
        };
    }, [JSON.stringify(filters), socket]);

    return { devices, loading, error };
};
