import prisma from '../prisma/prismaClient.js';

export const authRepository = {
  async findUserByAddress(walletAddress) {
    return prisma.user.findUnique({
      where: { walletAddress },
    });
  },

  async createUser(walletAddress, role) {
    return prisma.user.create({
      data: { walletAddress, role },
    });
  },

  async createNonce(walletAddress, nonce, expiresAt) {
    return prisma.walletNonce.create({
      data: { walletAddress, nonce, expiresAt },
    });
  },

  async findActiveNonce(walletAddress) {
    return prisma.walletNonce.findFirst({
      where: {
        walletAddress,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async markNonceAsUsed(id) {
    return prisma.walletNonce.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  async createUserSession(
    userId,
    sessionToken,
    expiresAt,
    refreshToken,
    refreshTokenExpiresAt
  ) {
    return prisma.userSession.create({
      data: {
        userId,
        sessionToken,
        expiresAt,
        refreshToken,
        refreshTokenExpiresAt,
      },
    });
  },

  async findSessionByToken(sessionToken) {
    return prisma.userSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
  },

  async findSessionByRefreshToken(refreshToken) {
    return prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  },

  async updateSessionTokens(
    sessionId,
    newSessionToken,
    newSessionExpiresAt,
    newRefreshToken,
    newRefreshTokenExpiresAt
  ) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: {
        sessionToken: newSessionToken,
        expiresAt: newSessionExpiresAt,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: newRefreshTokenExpiresAt,
      },
      include: { user: true },
    });
  },

  async deleteSession(token) {
    return prisma.userSession.deleteMany({
      where: { sessionToken: token },
    });
  },

  async deleteSessionById(sessionId) {
    return prisma.userSession.delete({
      where: { id: sessionId },
    });
  },

  async updateUserStatus(userId, updates) {
    return prisma.user.update({
      where: { id: userId },
      data: updates,
    });
  },

  async cleanupNonces(walletAddress) {
    return prisma.walletNonce.deleteMany({
      where: {
        walletAddress,
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            usedAt: {
              not: null,
            },
          },
        ],
      },
    });
  },
};