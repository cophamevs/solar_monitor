import apiClient from './apiClient';

interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        role: string;
    };
}

export const authService = {
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async getMe() {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
    }
};
