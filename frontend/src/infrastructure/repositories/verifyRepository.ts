// src/infrastructure/repositories/verifyRepository.ts

import { NFT_API_BASE_URL } from '@/src/core/config';
import { fetchJson, HttpError } from '@/src/infrastructure/http/fetchClient';
import type { PropertyVerifyPayload, PropertyVerifyReport } from '@/src/core/types';

function normalize(payload: PropertyVerifyPayload, tokenId: string): PropertyVerifyReport {
  const tamperProof =
    typeof payload.tamperProof === 'boolean'
      ? payload.tamperProof
      : payload.ok === true || payload.valid === true;

  return {
    ...payload,
    tokenId: String(payload.tokenId ?? tokenId),
    tamperProof,
    chainError: payload.chainError ?? null,
    filesIntegrity: Array.isArray(payload.filesIntegrity) ? payload.filesIntegrity : [],
    versionHistory: Array.isArray(payload.versionHistory) ? payload.versionHistory : [],
  };
}

const verifyRepository = {
  fetchReport: async (tokenId: string): Promise<PropertyVerifyReport> => {
    const data = await fetchJson<PropertyVerifyPayload>(
      `${NFT_API_BASE_URL}/api/verify/${encodeURIComponent(tokenId)}`,
    );
    return normalize(data, tokenId);
  },
};

export default verifyRepository;
