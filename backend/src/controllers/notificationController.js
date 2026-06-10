// src/controllers/notificationController.js
// Thin HTTP layer — delegates all logic to notificationService.

const notificationService = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const result = await notificationService.getNotifications(req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    await notificationService.markRead(req.params.id);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user);
    res.json({ message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    await notificationService.deleteNotification(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
