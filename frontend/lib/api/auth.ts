import apiClient from './client';
import type { User } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data;
  },

  register: async (userData: RegisterData): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post('/auth/refresh');
    return data.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const { data: response } = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  connectWallet: async (walletAddress: string): Promise<User> => {
    const { data } = await apiClient.post('/auth/connect-wallet', { walletAddress });
    return data.data;
  },
};
