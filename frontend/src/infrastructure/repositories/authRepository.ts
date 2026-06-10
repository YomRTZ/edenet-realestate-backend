// src/infrastructure/repositories/authRepository.ts
// Raw API calls for authentication. Returns data as-is — no business logic.

import apiClient from '@/src/infrastructure/http/axiosClient';
import type { User } from '@/src/core/types';

export interface LoginResponse {
  user: User;
  token: string;
  accessToken?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OtpPayload {
  email: string;
  code: string;
}

export interface WalletPayload {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface GoogleAuthPayload {
  credential: string;
}

const authRepository = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  register: async (payload: RegisterPayload): Promise<{ message: string; email: string }> => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  googleAuth: async (credential: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/google', { credential });
    return data;
  },

  verifyOtp: async (email: string, code: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/verify-otp', { email, code });
    return data;
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/resend-otp', { email });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  connectWallet: async (payload: WalletPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/connect-wallet', payload);
    return data;
  },

  disconnectWallet: async (): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/disconnect-wallet');
    return data;
  },
};

export default authRepository;
