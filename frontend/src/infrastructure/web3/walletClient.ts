// src/infrastructure/web3/walletClient.ts
// Low-level MetaMask / EIP-1193 interactions. No Redux, no business logic.

import { BrowserProvider, formatEther } from 'ethers';
import { EXPECTED_CHAIN_ID } from '@/src/core/config';
import { isAdminOnChain } from './contractClient';

const HARDHAT_CHAIN_HEX = `0x${EXPECTED_CHAIN_ID.toString(16)}`;

export interface WalletSession {
  address: string;
  chainId: number;
  balance: string;
  isAdminOnChain: boolean;
}

export function formatWalletError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  const e = error as { code?: number; message?: string };
  if (e?.code === 4001) return 'Connection cancelled — approve the MetaMask prompt.';
  if (e?.code === -32002) return 'MetaMask already has a pending request. Open MetaMask and try again.';
  if (typeof e?.message === 'string' && e.message) return e.message;
  return 'Failed to connect wallet. Install MetaMask, unlock it, and try again.';
}

function getEthereum(): EthereumProvider {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Install MetaMask to connect your wallet');
  }
  return window.ethereum;
}

async function switchToExpectedChain(provider: EthereumProvider): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_CHAIN_HEX }],
    });
    return;
  } catch (err: unknown) {
    if ((err as { code?: number }).code !== 4902) throw err;
  }
  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: HARDHAT_CHAIN_HEX,
      chainName: 'Hardhat Local',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['http://127.0.0.1:8545'],
    }],
  });
}

async function ensureCorrectChain(provider: EthereumProvider): Promise<number> {
  const hex = (await provider.request({ method: 'eth_chainId' })) as string;
  const chainId = parseInt(hex, 16);
  if (chainId !== EXPECTED_CHAIN_ID) {
    try {
      await switchToExpectedChain(provider);
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 4001) {
        throw new Error('Network switch cancelled — approve switching to Hardhat Local in MetaMask.');
      }
      throw new Error(`Switch to Hardhat Local (chain ${EXPECTED_CHAIN_ID}). Currently on chain ${chainId}.`);
    }
    const afterHex = (await provider.request({ method: 'eth_chainId' })) as string;
    return parseInt(afterHex, 16);
  }
  return chainId;
}

export async function connectWallet(requestAccounts = true): Promise<WalletSession> {
  const ethereum = getEthereum();
  const accounts = requestAccounts
    ? ((await ethereum.request({ method: 'eth_requestAccounts' })) as string[])
    : ((await ethereum.request({ method: 'eth_accounts' })) as string[]);

  if (!accounts?.length) throw new Error('No wallet account selected — unlock MetaMask and try again.');

  const address = accounts[0];
  const chainId = await ensureCorrectChain(ethereum);
  const browserProvider = new BrowserProvider(ethereum);
  const balanceWei = await browserProvider.getBalance(address);
  const signer = await browserProvider.getSigner();
  const adminStatus = await isAdminOnChain(signer, address);

  return {
    address,
    chainId,
    balance: formatEther(balanceWei),
    isAdminOnChain: adminStatus,
  };
}

export async function tryAutoConnect(): Promise<WalletSession | null> {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[];
  if (!accounts?.length) return null;
  try {
    return await connectWallet(false);
  } catch {
    return null;
  }
}
