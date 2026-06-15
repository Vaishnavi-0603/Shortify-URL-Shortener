import axios from 'axios';
import type { User, Url, AnalyticsData } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — clear storage and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>('/api/auth/login', data),

  getMe: () =>
    api.get<{ success: boolean; user: User }>('/api/auth/me'),
};

// ─── URLs ─────────────────────────────────────────────────────────────────────
export const urlApi = {
  create: (data: { originalUrl: string; customAlias?: string; expiryDate?: string }) =>
    api.post<{ success: boolean; data: Url }>('/api/urls', data),

  getAll: () =>
    api.get<{ success: boolean; data: Url[] }>('/api/urls'),

  update: (id: string, data: Partial<Pick<Url, 'originalUrl' | 'status' | 'expiryDate'>>) =>
    api.put<{ success: boolean; data: Url }>(`/api/urls/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/urls/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  get: (urlId: string) =>
    api.get<{ success: boolean; data: AnalyticsData }>(`/api/analytics/${urlId}`),
};

export default api;
