// src/services/propertyService.ts
// Business logic for loading, submitting, and verifying properties.

import type { Contract } from 'ethers';
import propertyRepository from '@/src/infrastructure/repositories/propertyRepository';
import { loadAllProperties } from '@/src/infrastructure/web3/registryReader';
import { getReadOnlyContract } from '@/src/infrastructure/web3/contractClient';
import type {
  RegistryProperty,
  PropertyDbRow,
  PropertyDbMap,
  PropertyImageDto,
} from '@/src/core/types';

/** Convert a base64 image DTO to a data URL string. */
export function imageToDataUrl(img: PropertyImageDto): string {
  return `data:${img.mimeType};base64,${img.data}`;
}

/** Merge approved DB metadata (name, location, price…) into the on-chain property. */
function mergeDb(
  chain: RegistryProperty,
  db: Record<string, unknown>,
): RegistryProperty {
  return {
    ...chain,
    name: String(db.name ?? chain.name),
    location: String(db.location ?? chain.location),
    propertyType: String(db.propertyType ?? chain.propertyType),
    isForRent: Boolean(db.isForRent ?? chain.isForRent),
  };
}

export interface PropertyCatalogResult {
  properties: RegistryProperty[];
  dbMap: PropertyDbMap;
  imageOverrides: Record<string, string[]>;
  chainError: string | null;
  apiWarning: string | null;
}

/**
 * Load the full property list — merges on-chain data with DB metadata and images.
 * @param signerContract - optional signer contract (from connected wallet)
 */
const propertyService = {
  loadCatalog: async (
    signerContract?: Contract | null,
  ): Promise<PropertyCatalogResult> => {
    let dbRows: PropertyDbRow[] = [];
    let dbMap: PropertyDbMap = {};
    let apiWarning: string | null = null;

    try {
      const catalog = await propertyRepository.fetchCatalog();
      dbRows = catalog.rows;
      dbMap = catalog.map;
    } catch {
      apiWarning = 'Could not load property files from API — showing on-chain data only.';
    }

    const contract = signerContract ?? getReadOnlyContract();
    if (!contract) {
      return {
        properties: [],
        dbMap,
        imageOverrides: {},
        chainError: 'Set NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_RPC_URL to load the registry.',
        apiWarning,
      };
    }

    let chainList: RegistryProperty[] = [];
    let chainError: string | null = null;

    try {
      chainList = await loadAllProperties(contract);
    } catch (err) {
      chainError =
        err instanceof Error ? err.message : 'Could not load properties from registry';
      return { properties: [], dbMap, imageOverrides: {}, chainError, apiWarning };
    }

    // Build tokenId → DB row map for metadata merge
    const dbDataMap: Record<string, PropertyDbRow> = {};
    for (const row of dbRows) {
      const tokenId = String(
        (row as Record<string, unknown>).tokenId ??
        (row as Record<string, unknown>).token_id ?? '',
      );
      if (tokenId) {
        dbDataMap[tokenId] = row;
        dbDataMap[String(Number(tokenId))] = row;
      }
    }

    const merged = chainList.map((p) => {
      const db = dbDataMap[p.id] ?? dbDataMap[String(Number(p.id))];
      return db ? mergeDb(p, db as Record<string, unknown>) : p;
    });

    // Fetch real images in parallel
    const imageOverrides: Record<string, string[]> = {};
    await Promise.all(
      merged.map(async (p) => {
        const dbId = dbMap[p.id] ?? dbMap[String(Number(p.id))];
        if (!dbId) return;
        try {
          const imgs = await propertyRepository.fetchImages(dbId);
          if (imgs.length > 0) {
            imageOverrides[p.id] = imgs.map(imageToDataUrl);
          }
        } catch { /* skip — images are not critical */ }
      }),
    );

    return { properties: merged, dbMap, imageOverrides, chainError, apiWarning };
  },

  fetchImages: async (dbId: string): Promise<PropertyImageDto[]> => {
    return propertyRepository.fetchImages(dbId);
  },

  fetchDocuments: async (dbId: string) => {
    return propertyRepository.fetchDocuments(dbId);
  },

  /** Step 1: Upload files, get hashes back. */
  prepareSubmission: async (
    fields: Record<string, string>,
    imageFiles: File[],
    documentFiles: File[],
  ) => {
    return propertyRepository.prepareRequest(fields, imageFiles, documentFiles);
  },

  /** Step 2: After chain tx confirmed, save to DB. */
  confirmSubmission: async (tempId: string, txHash: string): Promise<void> => {
    return propertyRepository.confirmRequest(tempId, txHash);
  },

  /** Submit a metadata update request for an owned property. */
  submitUpdate: async (
    dbPropertyId: string,
    fields: Record<string, string>,
    imageFiles: File[],
    documentFiles: File[],
  ) => {
    return propertyRepository.submitUpdateRequest(
      dbPropertyId, fields, imageFiles, documentFiles,
    );
  },
};

export default propertyService;
