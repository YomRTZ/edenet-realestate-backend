// src/infrastructure/repositories/propertyRepository.ts
// Raw API calls for properties. No business logic — just data in, data out.

import { NFT_API_BASE_URL } from '@/src/core/config';
import { fetchJson, fetchFormData } from '@/src/infrastructure/http/fetchClient';
import type {
  PropertyDbRow,
  PropertyDbMap,
  PropertyImageDto,
  PropertyDocumentDto,
} from '@/src/core/types';

// ── Catalog ──────────────────────────────────────────────────────────────────

function buildDbMap(rows: PropertyDbRow[]): PropertyDbMap {
  const map: PropertyDbMap = {};
  for (const row of rows) {
    const dbId = String(row.id ?? '');
    const rawTokenId = row.tokenId ?? row.token_id ?? row.nftId ?? row.nft_id ?? '';
    const tokenId = String(rawTokenId);
    if (!dbId || !tokenId) continue;
    map[tokenId] = dbId;
    const numeric = String(Number(tokenId));
    if (numeric !== tokenId && numeric !== 'NaN') map[numeric] = dbId;
  }
  return map;
}

export interface PropertyCatalog {
  rows: PropertyDbRow[];
  map: PropertyDbMap;
}

async function fetchCatalog(): Promise<PropertyCatalog> {
  const data = await fetchJson<unknown>(`${NFT_API_BASE_URL}/api/properties`);
  const rows = Array.isArray(data)
    ? (data as PropertyDbRow[])
    : ((data as Record<string, unknown>)?.properties as PropertyDbRow[]) ?? [];
  return { rows, map: buildDbMap(rows) };
}

async function fetchById(id: string): Promise<unknown> {
  return fetchJson(`${NFT_API_BASE_URL}/api/properties/${encodeURIComponent(id)}`);
}

// ── Files ────────────────────────────────────────────────────────────────────

async function fetchImages(
  dbId: string,
  versionNo?: number,
): Promise<PropertyImageDto[]> {
  const qs = versionNo != null ? `?versionNo=${versionNo}` : '';
  const data = await fetchJson<unknown>(
    `${NFT_API_BASE_URL}/api/properties/${dbId}/images${qs}`,
  );
  return Array.isArray(data) ? (data as PropertyImageDto[]) : [];
}

async function fetchDocuments(dbId: string): Promise<PropertyDocumentDto[]> {
  const data = await fetchJson<unknown>(
    `${NFT_API_BASE_URL}/api/properties/${dbId}/documents`,
  );
  return Array.isArray(data) ? (data as PropertyDocumentDto[]) : [];
}

// ── Submit / Confirm ─────────────────────────────────────────────────────────

export interface PrepareResult {
  tempId: string;
  hashes: {
    metadataHash: string;
    imagesRootHash: string;
    documentsRootHash: string;
  };
}

async function prepareRequest(
  fields: Record<string, string>,
  imageFiles: File[],
  documentFiles: File[],
): Promise<PrepareResult> {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  for (const f of imageFiles) body.append('images', f);
  for (const f of documentFiles) body.append('documents', f);

  const data = await fetchFormData<PrepareResult>(
    `${NFT_API_BASE_URL}/api/properties/request/prepare`,
    body,
  );
  if (!data?.hashes?.metadataHash) throw new Error('Server response missing hashes');
  return data;
}

async function confirmRequest(tempId: string, txHash: string): Promise<void> {
  await fetchJson<unknown>(`${NFT_API_BASE_URL}/api/properties/request/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempId, txHash }),
  });
}

async function submitUpdateRequest(
  dbPropertyId: string,
  fields: Record<string, string>,
  imageFiles: File[],
  documentFiles: File[],
): Promise<PrepareResult> {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  for (const f of imageFiles) body.append('images', f);
  for (const f of documentFiles) body.append('documents', f);

  const data = await fetchFormData<PrepareResult>(
    `${NFT_API_BASE_URL}/api/properties/${encodeURIComponent(dbPropertyId)}/update-request`,
    body,
  );
  if (!data?.hashes?.metadataHash) throw new Error('Server response missing hashes');
  return data;
}

const propertyRepository = {
  fetchCatalog,
  fetchById,
  fetchImages,
  fetchDocuments,
  prepareRequest,
  confirmRequest,
  submitUpdateRequest,
};

export default propertyRepository;
