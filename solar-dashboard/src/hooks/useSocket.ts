import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

export const useSocket = () => {
    const { setSocketStatus } = useStore();

    useEffect(() => {
        if (!socket) {
            const token = localStorage.getItem('token');

            socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket'], // Force websocket
                reconnection: true,
                autoConnect: true
            });

            socket.on('connect', () => {
                console.log('Socket connected:', socket?.id);
                setSocketStatus('connected');
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setSocketStatus('disconnected');
            });

            socket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setSocketStatus('disconnected');
            });
        }

        return () => {
            // We usually don't want to disconnect the socket on hook unmount in a SPA
            // unles we are leaving the authenticated area.
        };
    }, [setSocketStatus]);

    return socket;
};
