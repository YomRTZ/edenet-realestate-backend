/**
 * Shared in-memory stores for development fallback when DB is unavailable.
 * These stores are process-local and NOT shared across server restarts or multiple processes.
 * For production, all sessions must be stored in the database.
 */

export const inMemoryNonces = new Map(); // walletAddress -> { nonce, expiresAt, usedAt, createdAt }
export const inMemorySessions = new Map(); // refreshToken -> { refreshToken, sessionToken, user, sessionExpiry, refreshTokenExpiry, createdAt }
export const inMemorySessionsByToken = new Map(); // sessionToken -> { sessionToken, refreshToken, user, sessionExpiry, ...}
