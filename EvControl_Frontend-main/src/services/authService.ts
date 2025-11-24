import axios from 'axios';

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    token: string;
    message: string;
}

// CORREÇÃO: Remover "/login" da URL base
const API_URL = 'http://localhost:8080/api/auth';

export const authService = {
    login: async (credentials: LoginRequest): Promise<string> => {
        try {
            const response = await axios.post<LoginResponse>(`${API_URL}/login`, credentials);
            const { token } = response.data;
            localStorage.setItem('authToken', token); 
            
            return token;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.message || 
                               'Erro ao fazer login. Tente novamente.';
            return Promise.reject(new Error(errorMessage)); 
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
    },

    getToken: (): string | null => {
        return localStorage.getItem('authToken');
    },
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('authToken');
    }
};