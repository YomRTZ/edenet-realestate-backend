// src/services/notificationService.js
// Business logic for fetching, marking, and deleting notifications.

const prisma = require('../config/db');

function isGovUser(user) {
  const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
  return user.walletAddress && user.walletAddress.toLowerCase() === govWallet;
}

async function getNotifications(user) {
  const where = isGovUser(user) ? { forAdmin: true } : { userId: user.id, forAdmin: false };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { ...where, read: false } }),
  ]);

  return { notifications, unreadCount };
}

async function markRead(notificationId) {
  return prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
}

async function markAllRead(user) {
  const where = isGovUser(user) ? { forAdmin: true } : { userId: user.id, forAdmin: false };
  await prisma.notification.updateMany({ where, data: { read: true } });
}

async function deleteNotification(notificationId) {
  return prisma.notification.delete({ where: { id: notificationId } });
}

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
