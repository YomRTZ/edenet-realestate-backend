import crypto from 'crypto';
import { ethers } from 'ethers';

import { authRepository } from '../repositories/auth.repository.js';

import {
  inMemoryNonces,
  inMemorySessions,
  inMemorySessionsByToken,
} from './inMemoryStore.js';

const GOV_ADDRESS = (
  process.env.GOVERNMENT_PUBLIC_ADDRESS || ''
).toLowerCase();

const generateTokens = () => {
  const sessionToken = crypto.randomBytes(32).toString('hex');

  const refreshToken = crypto.randomBytes(32).toString('hex');

  const sessionExpiry = new Date(Date.now() + 15 * 60 * 1000);

  const refreshTokenExpiry = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  return {
    sessionToken,
    refreshToken,
    sessionExpiry,
    refreshTokenExpiry,
  };
};

export const authService = {
  async generateNonce(walletAddress) {
    const cleanAddress = walletAddress.toLowerCase();

    const nonce = crypto.randomBytes(16).toString('hex');

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      let user = await authRepository.findUserByAddress(cleanAddress);

      if (!user) {
        const isGov = cleanAddress === GOV_ADDRESS;

        user = await authRepository.createUser(
          cleanAddress,
          isGov ? 'Government' : 'Citizen'
        );
      }

      await authRepository.cleanupNonces(cleanAddress);

      await authRepository.createNonce(
        cleanAddress,
        nonce,
        expiresAt
      );

      inMemoryNonces.set(cleanAddress, {
        nonce,
        expiresAt,
        usedAt: null,
      });

      return nonce;
    } catch (error) {
      console.error(error);

      inMemoryNonces.set(cleanAddress, {
        nonce,
        expiresAt,
        usedAt: null,
      });

      return nonce;
    }
  },

  async verifyLogin(walletAddress, signature) {
    const cleanAddress = walletAddress.toLowerCase();

    let nonceRecord =
      await authRepository.findActiveNonce(cleanAddress);

    if (!nonceRecord) {
      nonceRecord = inMemoryNonces.get(cleanAddress);
    }

    if (!nonceRecord) {
      throw new Error('No active nonce found.');
    }

    const expectedMessage = `Sign to authorize access:\nNonce: ${nonceRecord.nonce}`;

    const recoveredAddress = ethers.verifyMessage(
      expectedMessage,
      signature
    );

    if (recoveredAddress.toLowerCase() !== cleanAddress) {
      throw new Error('Invalid signature.');
    }

    if (nonceRecord.id) {
      await authRepository.markNonceAsUsed(nonceRecord.id);
    }

    let user =
      await authRepository.findUserByAddress(cleanAddress);

    if (!user) {
      user = {
        id: `mem-${cleanAddress}`,
        walletAddress: cleanAddress,
        role:
          cleanAddress === GOV_ADDRESS
            ? 'Government'
            : 'Citizen',
        isOwner: false,
        isTenant: false,
      };
    }

    const {
      sessionToken,
      refreshToken,
      sessionExpiry,
      refreshTokenExpiry,
    } = generateTokens();

    if (!user.id.startsWith('mem-')) {
      await authRepository.createUserSession(
        user.id,
        sessionToken,
        sessionExpiry,
        refreshToken,
        refreshTokenExpiry
      );
    }

    inMemorySessions.set(refreshToken, {
      refreshToken,
      sessionToken,
      user,
      sessionExpiry,
      refreshTokenExpiry,
    });

    inMemorySessionsByToken.set(sessionToken, {
      sessionToken,
      refreshToken,
      user,
      sessionExpiry,
      refreshTokenExpiry,
    });

    return {
      user,
      sessionToken,
      refreshToken,
      sessionExpiry,
      refreshTokenExpiry,
    };
  },

  async refreshToken(oldRefreshToken) {
    let session =
      await authRepository.findSessionByRefreshToken(
        oldRefreshToken
      );

    if (!session) {
      session = inMemorySessions.get(oldRefreshToken);
    }

    if (!session) {
      throw new Error('Invalid refresh token.');
    }

    const expiry =
      session.refreshTokenExpiresAt ||
      session.refreshTokenExpiry;

    if (expiry < new Date()) {
      throw new Error('Refresh token expired.');
    }

    const oldSessionToken =
      session.sessionToken;

    const {
      sessionToken,
      refreshToken,
      sessionExpiry,
      refreshTokenExpiry,
    } = generateTokens();

    if (session.id) {
      await authRepository.updateSessionTokens(
        session.id,
        sessionToken,
        sessionExpiry,
        refreshToken,
        refreshTokenExpiry
      );
    }

    inMemorySessions.delete(oldRefreshToken);
    inMemorySessionsByToken.delete(oldSessionToken);

    inMemorySessions.set(refreshToken, {
      refreshToken,
      sessionToken,
      user: session.user,
      sessionExpiry,
      refreshTokenExpiry,
    });

    inMemorySessionsByToken.set(sessionToken, {
      sessionToken,
      refreshToken,
      user: session.user,
      sessionExpiry,
      refreshTokenExpiry,
    });

    return {
      user: session.user,
      sessionToken,
      refreshToken,
      sessionExpiry,
      refreshTokenExpiry,
    };
  },

  async updateCitizenStatus(userId, action) {
    const updates =
      action === 'list'
        ? { isOwner: true }
        : { isTenant: true };

    return authRepository.updateUserStatus(
      userId,
      updates
    );
  },

  async logout(token) {
    if (!token) return;

    await authRepository.deleteSession(token);

    inMemorySessionsByToken.delete(token);
  },
};