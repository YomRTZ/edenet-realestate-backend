import { getPrisma } from '../prisma/prismaClient.js';

export const authRepository = {
  async findUserByAddress(walletAddress) {
    const prisma = getPrisma();
    return prisma.user.findUnique({ where: { walletAddress } });
  },

  async createUser(walletAddress, role) {
    const prisma = getPrisma();
    return prisma.user.create({ data: { walletAddress, role } });
  },

  async createNonce(walletAddress, nonce, expiresAt) {
    const prisma = getPrisma();
    return prisma.walletNonce.create({ data: { walletAddress, nonce, expiresAt } });
  },

  async findActiveNonce(walletAddress) {
    const prisma = getPrisma();
    return prisma.walletNonce.findFirst({
      where: { walletAddress, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
  },

  async markNonceAsUsed(id) {
    const prisma = getPrisma();
    return prisma.walletNonce.update({ where: { id }, data: { usedAt: new Date() } });
  },

  async createUserSession(userId, sessionToken, expiresAt) {
    const prisma = getPrisma();
    return prisma.userSession.create({ data: { userId, sessionToken, expiresAt } });
  },

  async deleteSession(token) {
    const prisma = getPrisma();
    return prisma.userSession.deleteMany({ where: { sessionToken: token } });
  },

  async updateUserStatus(userId, updates) {
    const prisma = getPrisma();
    return prisma.user.update({ where: { id: userId }, data: updates });
  }
};
