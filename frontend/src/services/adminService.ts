// src/services/adminService.ts
// Business logic for government admin actions.

import adminRepository from '@/src/infrastructure/repositories/adminRepository';
import type { AdminPropertyRequest, ApproveResult } from '@/src/infrastructure/repositories/adminRepository';

export type { AdminPropertyRequest, ApproveResult };

const adminService = {
  /** Fetch property requests by status. */
  fetchRequests: async (
    wallet: string,
    status: 'PENDING' | 'APPROVED' | 'DECLINED' = 'PENDING',
  ): Promise<AdminPropertyRequest[]> => {
    return adminRepository.fetchRequests(wallet, status);
  },

  /** Approve a MINT request — requires the on-chain request ID. */
  approveMint: async (
    wallet: string,
    dbRequestId: string,
    onChainRequestId: number,
  ): Promise<ApproveResult> => {
    return adminRepository.approveRequest(wallet, dbRequestId, { onChainRequestId });
  },

  /** Approve an UPDATE request. */
  approveUpdate: async (
    wallet: string,
    dbRequestId: string,
    onChainUpdateIndex: number,
  ): Promise<ApproveResult> => {
    return adminRepository.approveRequest(wallet, dbRequestId, { onChainUpdateIndex });
  },

  /** Decline any request with a reason. */
  declineRequest: async (
    wallet: string,
    dbRequestId: string,
    reason: string,
  ): Promise<unknown> => {
    return adminRepository.declineRequest(wallet, dbRequestId, reason);
  },

  /** Fetch all users. */
  fetchUsers: async (wallet: string) => {
    return adminRepository.fetchUsers(wallet);
  },

  /** Fetch users pending KYC review. */
  fetchPendingKyc: async (wallet: string) => {
    return adminRepository.fetchPendingKyc(wallet);
  },

  /** Approve a user's KYC. */
  approveKyc: async (wallet: string, userId: string) => {
    return adminRepository.approveKyc(wallet, userId);
  },

  /** Reject a user's KYC with a reason. */
  rejectKyc: async (wallet: string, userId: string, reason: string) => {
    return adminRepository.rejectKyc(wallet, userId, reason);
  },

  /** Fetch analytics data. */
  fetchAnalytics: async (wallet: string) => {
    return adminRepository.fetchAnalytics(wallet);
  },
};

export default adminService;
