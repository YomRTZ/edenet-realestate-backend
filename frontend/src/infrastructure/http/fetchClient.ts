// src/infrastructure/http/fetchClient.ts
// Thin wrapper around native fetch with JSON parsing and structured error handling.
// Used for multipart/FormData endpoints where axios would complicate things.

import { TOKEN_STORAGE_KEY } from '@/src/core/config';

export class HttpError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response): Promise<never> {
  const text = await res.text().catch(() => res.statusText);
  let message = text || `Request failed (${res.status})`;
  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    if (data.error) message = data.error;
    else if (data.message) message = data.message;
  } catch { /* plain text */ }
  throw new HttpError(message, res.status);
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

export async function fetchFormData<T>(
  url: string,
  body: FormData,
  method = 'POST',
): Promise<T> {
  const res = await fetch(url, {
    method,
    body,
    headers: getAuthHeaders(),
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

export async function fetchVoid(url: string, init?: RequestInit): Promise<void> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) return parseError(res);
}
