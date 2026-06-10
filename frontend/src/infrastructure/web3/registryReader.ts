// src/infrastructure/web3/registryReader.ts
// Read-only on-chain queries for the property registry.

import { Contract, formatEther } from 'ethers';
import type {
  RegistryProperty,
  MetadataVersionEntry,
  OwnershipHistoryEntry,
} from '@/src/core/types';

function toNumber(value: unknown): number {
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  return Number(value ?? 0);
}

function mapRawProperty(raw: Record<string, unknown>, index: number): RegistryProperty {
  const id = raw.id != null ? String(raw.id) : String(index);
  const details =
    raw.details != null && typeof raw.details === 'object'
      ? (raw.details as Record<string, unknown>)
      : raw;

  const rawPrice = details.price ?? 0;
  const priceNum = toNumber(rawPrice);
  const priceWei =
    priceNum > 1e15
      ? BigInt(String(rawPrice))
      : BigInt(priceNum) * BigInt('1000000000000000000');

  return {
    id,
    owner: String(raw.owner ?? ''),
    name: String(details.name ?? `Property #${id}`),
    location: String(details.location ?? ''),
    propertyType: String(details.propertyType ?? ''),
    priceEth: formatEther(priceWei),
    priceWei,
    isForSale: Boolean(details.isForSale),
    isForRent: Boolean(details.isForRent ?? false),
    bedrooms: toNumber(details.bedrooms),
    bathrooms: toNumber(details.bathrooms),
    sqft: toNumber(details.sqft),
    parking: toNumber(details.parking) > 0,
    floors: toNumber(details.floors),
    yearBuilt: toNumber(details.yearBuilt),
    metadataHash: String(details.metadataHash ?? ''),
    imagesRootHash: String(details.imagesRootHash ?? ''),
    documentsRootHash: String(details.documentsRootHash ?? ''),
  };
}

function toRecord(raw: unknown): Record<string, unknown> {
  if (raw && typeof (raw as { toObject?: () => Record<string, unknown> }).toObject === 'function') {
    return (raw as { toObject: () => Record<string, unknown> }).toObject();
  }
  return (raw ?? {}) as Record<string, unknown>;
}

export async function loadAllProperties(contract: Contract): Promise<RegistryProperty[]> {
  try {
    const total = Number(await contract.getTotalProperties());
    if (total === 0) return [];
    const list: RegistryProperty[] = [];
    for (let i = 0; i < total; i++) {
      const raw = await contract.properties(i);
      list.push(mapRawProperty(toRecord(raw), i));
    }
    return list;
  } catch (err) {
    console.warn('[registryReader] loadAllProperties failed:', err);
    return [];
  }
}

export async function loadMetadataVersions(
  contract: Contract,
  tokenId: string,
): Promise<MetadataVersionEntry[]> {
  try {
    const rows = (await contract.getMetadataVersions(tokenId)) as unknown[];
    return rows.map((row) => {
      const r = toRecord(row);
      return {
        versionNo: r.versionNo != null ? Number(r.versionNo) : undefined,
        metadataHash: String(r.metadataHash ?? ''),
        imagesRootHash: String(r.imagesRootHash ?? ''),
        documentsRootHash: String(r.documentsRootHash ?? ''),
        timestamp: r.timestamp as MetadataVersionEntry['timestamp'],
      };
    });
  } catch (err) {
    console.warn('[registryReader] loadMetadataVersions failed:', err);
    return [];
  }
}

export async function loadOwnershipHistory(
  contract: Contract,
  tokenId: string,
): Promise<OwnershipHistoryEntry[]> {
  try {
    const rows = (await contract.getOwnershipHistory(tokenId)) as unknown[];
    return rows.map((row) => {
      const r = toRecord(row);
      return {
        owner: String(r.to ?? r.owner ?? ''),
        from: String(r.from ?? ''),
        to: String(r.to ?? ''),
        timestamp: r.timestamp as OwnershipHistoryEntry['timestamp'],
        price: r.price as OwnershipHistoryEntry['price'],
      };
    });
  } catch (err) {
    console.warn('[registryReader] loadOwnershipHistory failed:', err);
    return [];
  }
}
