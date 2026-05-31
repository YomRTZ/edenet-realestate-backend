import * as service from '../services/notification.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createNotification = catchAsync(async (req, res) => {
  const notification = await service.createNotification(req.params.userId, req.body);
  res.status(201).json({ success: true, message: 'Notification created', data: notification });
});

export const getUserNotifications = catchAsync(async (req, res) => {
  const notifications = await service.getUserNotifications(req.params.userId, req.query);
  res.json({ success: true, data: notifications });
});

export const getNotificationById = catchAsync(async (req, res) => {
  const notification = await service.getNotificationById(req.params.notificationId);
  res.json({ success: true, data: notification });
});

export const updateNotification = catchAsync(async (req, res) => {
  const notification = await service.updateNotification(req.params.notificationId, req.body);
  res.json({ success: true, message: 'Notification updated', data: notification });
});

export const deleteNotification = catchAsync(async (req, res) => {
  await service.deleteNotification(req.params.notificationId);
  res.json({ success: true, message: 'Notification deleted' });
});

export const markNotificationRead = catchAsync(async (req, res) => {
  const notification = await service.markAsRead(req.params.notificationId);
  res.json({ success: true, message: 'Notification marked read', data: notification });
});
