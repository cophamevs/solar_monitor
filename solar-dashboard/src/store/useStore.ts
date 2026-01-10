import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    role: string;
}

interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    theme: 'light' | 'dark';
    socketStatus: 'connected' | 'disconnected';

    setUser: (user: User | null) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setSocketStatus: (status: 'connected' | 'disconnected') => void;
    logout: () => void;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    isAuthenticated: false,
    theme: 'light',
    socketStatus: 'disconnected',

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    },
    setSocketStatus: (socketStatus) => set({ socketStatus }),
    logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
    }
}));
