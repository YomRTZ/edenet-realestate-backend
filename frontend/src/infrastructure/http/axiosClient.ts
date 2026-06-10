// src/infrastructure/http/axiosClient.ts
// Axios instance with JWT auth interceptor and 401 auto-redirect.

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { NFT_API_BASE_URL, TOKEN_STORAGE_KEY } from '@/src/core/config';

const apiClient: AxiosInstance = axios.create({
  baseURL: `${NFT_API_BASE_URL}/api`,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401
apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
