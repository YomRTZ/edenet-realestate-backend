// src/utils/notifications.js
// Thin helpers for creating Notification rows in Postgres.
// All functions are fire-and-forget — they log errors but never throw.

const prisma = require('../config/db');

/**
 * Create a notification for a specific citizen user.
 * @param {string} userId
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {string|null} link
 */
async function notifyUser(userId, type, title, message, link = null) {
  try {
    await prisma.notification.create({
      data: { userId, forAdmin: false, type, title, message, link },
    });
  } catch (err) {
    console.error('[notifications] notifyUser failed:', err.message);
  }
}

/**
 * Create a notification visible to all government/admin accounts.
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {string|null} link
 */
async function notifyAdmin(type, title, message, link = null) {
  try {
    await prisma.notification.create({
      data: { userId: null, forAdmin: true, type, title, message, link },
    });
  } catch (err) {
    console.error('[notifications] notifyAdmin failed:', err.message);
  }
}

/**
 * Create a notification for the user who owns the given wallet address.
 * @param {string} walletAddress
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {string|null} link
 */
async function notifyUserByWallet(walletAddress, type, title, message, link = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (user) await notifyUser(user.id, type, title, message, link);
  } catch (err) {
    console.error('[notifications] notifyUserByWallet failed:', err.message);
  }
}

module.exports = { notifyUser, notifyAdmin, notifyUserByWallet };
