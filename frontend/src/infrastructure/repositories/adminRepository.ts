// src/infrastructure/repositories/adminRepository.ts
// Raw API calls for government admin endpoints.

import { NFT_API_BASE_URL } from '@/src/core/config';
import { fetchJson } from '@/src/infrastructure/http/fetchClient';

export type AdminRequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

export interface AdminPropertyRequest {
  id: string;
  status: AdminRequestStatus;
  submittedBy?: string;
  name?: string;
  location?: string;
  price?: string | number;
  propertyId?: string;
  tokenId?: string | number;
  type?: 'MINT' | 'UPDATE';
  declineReason?: string;
  metadataSnapshot?: Record<string, unknown>;
  documentIds?: string[];
  createdAt?: string;
  [key: string]: unknown;
}

export interface ApproveResult {
  tokenId?: string;
  txHash?: string;
  message?: string;
  [key: string]: unknown;
}

export interface AdminUser {
  id: string;
  email: string;
  status: string;
  walletAddress?: string;
  authProvider: string;
  createdAt: string;
  role: 'GOVERNMENT' | 'CITIZEN';
  kycDocuments: {
    id: string;
    docType: string;
    status: string;
    reviewedAt?: string;
    reviewedBy?: string;
  }[];
}

function govHeaders(wallet: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-gov-wallet': wallet,
  };
}

const adminRepository = {
  fetchRequests: async (
    wallet: string,
    status: AdminRequestStatus = 'PENDING',
  ): Promise<AdminPropertyRequest[]> => {
    const data = await fetchJson<AdminPropertyRequest[] | { requests: AdminPropertyRequest[] }>(
      `${NFT_API_BASE_URL}/api/admin/requests?status=${status}`,
      { headers: govHeaders(wallet) },
    );
    return Array.isArray(data) ? data : (data.requests ?? []);
  },

  approveRequest: async (
    wallet: string,
    dbRequestId: string,
    body: Record<string, unknown>,
  ): Promise<ApproveResult> => {
    return fetchJson(`${NFT_API_BASE_URL}/api/admin/approve/${encodeURIComponent(dbRequestId)}`, {
      method: 'POST',
      headers: govHeaders(wallet),
      body: JSON.stringify(body),
    });
  },

  declineRequest: async (
    wallet: string,
    dbRequestId: string,
    reason: string,
  ): Promise<unknown> => {
    return fetchJson(`${NFT_API_BASE_URL}/api/admin/decline/${encodeURIComponent(dbRequestId)}`, {
      method: 'POST',
      headers: govHeaders(wallet),
      body: JSON.stringify({ reason }),
    });
  },

  fetchUsers: async (wallet: string): Promise<AdminUser[]> => {
    return fetchJson(`${NFT_API_BASE_URL}/api/admin/users`, {
      headers: govHeaders(wallet),
    });
  },

  fetchPendingKyc: async (wallet: string): Promise<AdminUser[]> => {
    return fetchJson(`${NFT_API_BASE_URL}/api/admin/kyc/pending`, {
      headers: govHeaders(wallet),
    });
  },

  approveKyc: async (wallet: string, userId: string): Promise<unknown> => {
    return fetchJson(`${NFT_API_BASE_URL}/api/admin/kyc/${userId}/approve`, {
      method: 'POST',
      headers: govHeaders(wallet),
    });
  },

  rejectKyc: async (wallet: string, userId: string, reason: string): Promise<unknown> => {
    return fetchJson(`${NFT_API_BASE_URL}/api/admin/kyc/${userId}/reject`, {
      method: 'POST',
      headers: govHeaders(wallet),
      body: JSON.stringify({ reason }),
    });
  },

  fetchAnalytics: async (wallet: string): Promise<unknown> => {
    return fetchJson(`${NFT_API_BASE_URL}/api/admin/analytics`, {
      headers: govHeaders(wallet),
    });
  },
};

export default adminRepository;
