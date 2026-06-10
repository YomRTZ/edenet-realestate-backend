const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a notification for a specific user (citizen)
 */
async function notifyUser(userId, type, title, message, link = null) {
  try {
    await prisma.notification.create({
      data: { userId, forAdmin: false, type, title, message, link },
    });
  } catch (err) {
    console.error('Failed to create user notification:', err.message);
  }
}

/**
 * Create a notification visible to all government/admin accounts
 */
async function notifyAdmin(type, title, message, link = null) {
  try {
    await prisma.notification.create({
      data: { userId: null, forAdmin: true, type, title, message, link },
    });
  } catch (err) {
    console.error('Failed to create admin notification:', err.message);
  }
}

async function notifyUserByWallet(walletAddress, type, title, message, link = null) {
  try {
    const user = await prisma.user.findUnique({ where: { walletAddress: walletAddress.toLowerCase() } });
    if (user) {
      await notifyUser(user.id, type, title, message, link);
    }
  } catch (err) {
    console.error('Failed to create notification by wallet:', err.message);
  }
}

module.exports = { notifyUser, notifyAdmin, notifyUserByWallet };
