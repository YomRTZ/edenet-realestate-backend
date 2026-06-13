import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { authRepository } from '../repositories/auth.repository.js';

// In-memory fallback store for development when the DB is unavailable.
const inMemoryNonces = new Map();

// Centralized JWT secret with a safe development fallback so jwt.sign
// never throws `secretOrPrivateKey must have a value` during local runs.
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('Warning: JWT_SECRET not set; using `dev-secret` fallback. Set JWT_SECRET in production.');
  return 'dev-secret';
})();

const GOV_ADDRESS = (process.env.GOVERNMENT_PUBLIC_ADDRESS || '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266').toLowerCase();

export const authService = {
  async generateNonce(walletAddress) {
    const cleanAddress = walletAddress && String(walletAddress).toLowerCase();
    console.log('generateNonce called for:', cleanAddress);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[REDACTED]' : 'not-set');

    const generatedNonce = crypto.randomBytes(16).toString('hex');
    const expiryTimestamp = new Date(Date.now() + 5 * 60 * 1000);

    // Try DB-backed flow first; on error, fall back to in-memory store (dev only)
    try {
      let user = await authRepository.findUserByAddress(cleanAddress);
      if (!user) {
        const isGov = cleanAddress === GOV_ADDRESS;
        user = await authRepository.createUser(cleanAddress, isGov ? 'Government' : 'Citizen');
      }

      await authRepository.createNonce(cleanAddress, generatedNonce, expiryTimestamp);
      // Also keep a short-lived in-memory copy so immediate subsequent
      // verification (from the same server process) is resilient to DB
      // visibility or transactional delays during development.
      inMemoryNonces.set(cleanAddress, { nonce: generatedNonce, expiresAt: expiryTimestamp, usedAt: null, createdAt: new Date(), persisted: true });
      console.log('generateNonce: persisted nonce to DB and cached in-memory for', cleanAddress);
      return generatedNonce;
    } catch (err) {
      console.warn('DB path failed for generateNonce, using in-memory fallback:', err && (err.message || err));
      // Store in-memory so verifyLogin can validate later during this process lifetime
      inMemoryNonces.set(cleanAddress, { nonce: generatedNonce, expiresAt: expiryTimestamp, usedAt: null, createdAt: new Date() });
      return generatedNonce;
    }
  },

  async verifyLogin(walletAddress, signature) {
    const cleanAddress = walletAddress.toLowerCase();
    // Try DB-backed flow first; if no active nonce or DB fails, check in-memory fallback
    try {
      const activeNonceRecord = await authRepository.findActiveNonce(cleanAddress);
      console.log('verifyLogin: activeNonceRecord=', activeNonceRecord ? { id: activeNonceRecord.id, nonce: activeNonceRecord.nonce, expiresAt: activeNonceRecord.expiresAt } : null);
      if (activeNonceRecord) {
        const expectedMessage = `Sign to authorize access:\nNonce: ${activeNonceRecord.nonce}`;
        console.log('verifyLogin: expectedMessage=', expectedMessage);
        const recoveredSigner = ethers.verifyMessage(expectedMessage, signature);
        console.log('verifyLogin: recoveredSigner=', recoveredSigner);

        if (recoveredSigner.toLowerCase() !== cleanAddress) {
          console.error('Signature mismatch: recovered', recoveredSigner.toLowerCase(), 'expected', cleanAddress);
          throw new Error('Signature mapping verification failed.');
        }

        await authRepository.markNonceAsUsed(activeNonceRecord.id);

        const user = await authRepository.findUserByAddress(cleanAddress);
        const sessionToken = jwt.sign({ id: user.id, wallet: user.walletAddress }, JWT_SECRET, { expiresIn: '2h' });
        const sessionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

        await authRepository.createUserSession(user.id, sessionToken, sessionExpiry);

        return { user, sessionToken };
      }
    } catch (err) {
      console.warn('DB verifyLogin path failed or no DB nonce found, falling back to in-memory nonces:', err && (err.message || err));
    }

    // In-memory fallback: validate nonce if present
    const mem = inMemoryNonces.get(cleanAddress);
    console.log('verifyLogin: in-memory nonce=', mem);
    if (!mem || mem.usedAt || (mem.expiresAt && new Date(mem.expiresAt) <= new Date())) {
      throw new Error('No active unexpired authorization challenges found.');
    }

    const expectedMessage = `Sign to authorize access:\nNonce: ${mem.nonce}`;
    const recoveredSigner = ethers.verifyMessage(expectedMessage, signature);
    if (recoveredSigner.toLowerCase() !== cleanAddress) {
      throw new Error('Signature mapping verification failed.');
    }

    // mark as used in memory
    mem.usedAt = new Date();
    inMemoryNonces.set(cleanAddress, mem);

    // Create a minimal in-memory user object if DB is unavailable
    let user = null;
    try {
      user = await authRepository.findUserByAddress(cleanAddress);
    } catch (err) {
      console.warn('Could not fetch user from DB; creating transient user object for session.');
    }

    if (!user) {
      user = { id: `mem-${cleanAddress}`, walletAddress: cleanAddress, role: cleanAddress === GOV_ADDRESS ? 'Government' : 'Citizen', isOwner: false, isTenant: false };
    }

    const sessionToken = jwt.sign({ id: user.id, wallet: user.walletAddress }, JWT_SECRET, { expiresIn: '2h' });
    const sessionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Try to persist session in DB but ignore failures (dev fallback)
    try {
      if (user && !String(user.id).startsWith('mem-')) {
        await authRepository.createUserSession(user.id, sessionToken, sessionExpiry);
      }
    } catch (err) {
      console.warn('Could not persist session in DB; continuing with in-memory session token.');
    }

    return { user, sessionToken };
  },

  async updateCitizenStatus(userId, action) {
    const targetModifications = action === 'list' ? { isOwner: true } : { isTenant: true };
    return authRepository.updateUserStatus(userId, targetModifications);
  },

  async logout(token) {
    if (token) {
      await authRepository.deleteSession(token);
    }
  }
};
