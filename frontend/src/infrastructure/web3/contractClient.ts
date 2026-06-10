// src/infrastructure/web3/contractClient.ts
// Ethers v6 contract factory. No business logic — just returns typed contract instances.

import { Contract, JsonRpcProvider, type ContractRunner } from 'ethers';
import RealEstateArtifact from '@/abi/RealEstate.json';
import { CONTRACT_ADDRESS, RPC_URL } from '@/src/core/config';

export const CONTRACT_ABI = RealEstateArtifact.abi;

/** Get a contract instance with the provided signer or provider. */
export function getContract(runner: ContractRunner): Contract {
  if (!CONTRACT_ADDRESS) throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
}

/** Get a read-only contract instance using the public RPC. */
export function getReadOnlyContract(): Contract | null {
  if (!CONTRACT_ADDRESS) return null;
  try {
    const provider = new JsonRpcProvider(RPC_URL);
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch {
    return null;
  }
}

/** Check if the given address is an admin on-chain. Returns false on error. */
export async function isAdminOnChain(
  runner: ContractRunner,
  address: string,
): Promise<boolean> {
  if (!CONTRACT_ADDRESS) return false;
  try {
    return Boolean(await getContract(runner).isAdmin(address));
  } catch {
    return false;
  }
}
