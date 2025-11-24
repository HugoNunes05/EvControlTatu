import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
    const token = authService.getToken();
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
