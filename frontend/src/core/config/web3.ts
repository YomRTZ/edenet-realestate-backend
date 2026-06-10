// src/core/config/web3.ts
// Single source of truth for all blockchain configuration.

export const NFT_API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';

export const RPC_URL =
  (process.env.NEXT_PUBLIC_RPC_URL ?? 'http://127.0.0.1:8545').replace(/\/$/, '');

export const EXPECTED_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? '31337',
);

export const GOV_WALLET = (
  process.env.NEXT_PUBLIC_GOV_WALLET ?? ''
).toLowerCase();

export const WALLET_STORAGE_KEY = 'edenet-wallet-address';

export function isGovWalletAddress(address: string | null | undefined): boolean {
  if (!address || !GOV_WALLET) return false;
  return address.toLowerCase() === GOV_WALLET;
}
