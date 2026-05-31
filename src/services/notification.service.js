import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createNotification = async (userId, data) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const notification = await models.Notification.create({
      user_id: userId,
      title: data.title,
      message: data.message,
      notification_type: data.notification_type || null,
    });

    return notification;
  } catch (error) {
    console.error('[createNotification] Error:', error.message);
    throw error;
  }
};

export const getUserNotifications = async (userId, options = {}) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    return await models.Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: options.limit || 100,
      offset: options.offset || 0,
    });
  } catch (error) {
    console.error('[getUserNotifications] Error:', error.message);
    throw error;
  }
};

export const getNotificationById = async (notificationId) => {
  try {
    const notification = await models.Notification.findByPk(notificationId);
    if (!notification) throw new AppError('Notification not found', 404);
    return notification;
  } catch (error) {
    console.error('[getNotificationById] Error:', error.message);
    throw error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const notification = await models.Notification.findByPk(notificationId);
    if (!notification) throw new AppError('Notification not found', 404);

    await notification.update({ is_read: true, read_at: new Date() });
    return notification;
  } catch (error) {
    console.error('[markAsRead] Error:', error.message);
    throw error;
  }
};

export const updateNotification = async (notificationId, data) => {
  try {
    const notification = await models.Notification.findByPk(notificationId);
    if (!notification) throw new AppError('Notification not found', 404);

    await notification.update(data);
    return notification;
  } catch (error) {
    console.error('[updateNotification] Error:', error.message);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const notification = await models.Notification.findByPk(notificationId);
    if (!notification) throw new AppError('Notification not found', 404);

    await notification.destroy();
  } catch (error) {
    console.error('[deleteNotification] Error:', error.message);
    throw error;
  }
};
