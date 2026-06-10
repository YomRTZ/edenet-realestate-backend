// src/core/types/user.ts

export type UserRole = 'ADMIN' | 'USER';
export type UserStatus =
  | 'PENDING_EMAIL'
  | 'PENDING_KYC'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status?: UserStatus;
  avatar?: string;
  phone?: string;
  walletAddress?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
