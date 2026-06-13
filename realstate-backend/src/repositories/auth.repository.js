import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const { PrismaClient } = pkg;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

export const authRepository = {
  async findUserByAddress(walletAddress) {
    return prisma.user.findUnique({ where: { walletAddress } });
  },

  async createUser(walletAddress, role) {
    return prisma.user.create({ data: { walletAddress, role } });
  },

  async createNonce(walletAddress, nonce, expiresAt) {
    return prisma.walletNonce.create({ data: { walletAddress, nonce, expiresAt } });
  },

  async findActiveNonce(walletAddress) {
    return prisma.walletNonce.findFirst({
      where: { walletAddress, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
  },

  async markNonceAsUsed(id) {
    return prisma.walletNonce.update({ where: { id }, data: { usedAt: new Date() } });
  },

  async createUserSession(userId, sessionToken, expiresAt) {
    return prisma.userSession.create({ data: { userId, sessionToken, expiresAt } });
  },

  async deleteSession(token) {
    return prisma.userSession.deleteMany({ where: { sessionToken: token } });
  },

  async updateUserStatus(userId, updates) {
    return prisma.user.update({ where: { id: userId }, data: updates });
  }
};
