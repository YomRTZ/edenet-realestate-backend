const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

function isGovUser(user) {
  const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
  return user.walletAddress && user.walletAddress.toLowerCase() === govWallet;
}

/**
 * GET /api/notifications
 * Returns notifications for the current user (citizen) or all admin notifications (government)
 */
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = isGovUser(req.user);
    const where = isAdmin ? { forAdmin: true } : { userId: req.user.id, forAdmin: false };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({ where: { ...where, read: false } });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[GET /notifications]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/notifications/:id/read
 */
router.post('/:id/read', auth, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('[POST /notifications/:id/read]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/notifications/read-all
 */
router.post('/read-all', auth, async (req, res) => {
  try {
    const isAdmin = isGovUser(req.user);
    const where = isAdmin ? { forAdmin: true } : { userId: req.user.id, forAdmin: false };

    await prisma.notification.updateMany({ where, data: { read: true } });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    console.error('[POST /notifications/read-all]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[DELETE /notifications/:id]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
