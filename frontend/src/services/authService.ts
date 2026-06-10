// src/services/authService.ts
// Business logic for authentication flows.

import authRepository from '@/src/infrastructure/repositories/authRepository';
import { TOKEN_STORAGE_KEY } from '@/src/core/config';
import type { User } from '@/src/core/types';

function persistToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export interface AuthResult {
  user: User;
  token: string;
}

const authService = {
  /** Email + password login. Persists token on success. */
  login: async (email: string, password: string): Promise<AuthResult> => {
    const res = await authRepository.login(email, password);
    const token = res.token ?? res.accessToken ?? '';
    persistToken(token);
    return { user: res.user, token };
  },

  /** Register a new account. Does not log in automatically (requires OTP). */
  register: async (
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ message: string; email: string }> => {
    return authRepository.register({ email, password, confirmPassword });
  },

  /** Google OAuth — logs in or creates account. */
  googleAuth: async (credential: string): Promise<AuthResult> => {
    const res = await authRepository.googleAuth(credential);
    const token = res.token ?? res.accessToken ?? '';
    persistToken(token);
    return { user: res.user, token };
  },

  /** Verify OTP after registration. */
  verifyOtp: async (email: string, code: string): Promise<AuthResult> => {
    const res = await authRepository.verifyOtp(email, code);
    const token = res.token ?? res.accessToken ?? '';
    persistToken(token);
    return { user: res.user, token };
  },

  /** Resend OTP email. */
  resendOtp: async (email: string): Promise<{ message: string }> => {
    return authRepository.resendOtp(email);
  },

  /** Fetch the currently authenticated user from the server. */
  getMe: async (): Promise<User> => {
    return authRepository.getMe();
  },

  /** Connect a wallet to the user account (requires signature proof). */
  connectWallet: async (
    walletAddress: string,
    signature: string,
    message: string,
  ): Promise<AuthResult> => {
    const res = await authRepository.connectWallet({ walletAddress, signature, message });
    const token = res.token ?? res.accessToken ?? '';
    persistToken(token);
    return { user: res.user, token };
  },

  /** Disconnect the wallet from the account. */
  disconnectWallet: async (): Promise<AuthResult> => {
    const res = await authRepository.disconnectWallet();
    const token = res.token ?? res.accessToken ?? '';
    persistToken(token);
    return { user: res.user, token };
  },

  /** Clear auth state from storage. */
  logout: () => {
    clearToken();
  },
};

export default authService;
