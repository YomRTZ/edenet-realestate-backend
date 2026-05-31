import express from 'express';
import * as controller from '../controllers/notification.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createNotificationSchema, updateNotificationSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/users/:userId/notifications', verifyToken, validate(createNotificationSchema), controller.createNotification);
router.get('/users/:userId/notifications', verifyToken, controller.getUserNotifications);
router.get('/users/notifications/:notificationId', verifyToken, controller.getNotificationById);
router.put('/users/notifications/:notificationId', verifyToken, validate(updateNotificationSchema), controller.updateNotification);
router.delete('/users/notifications/:notificationId', verifyToken, controller.deleteNotification);
router.post('/users/notifications/:notificationId/read', verifyToken, controller.markNotificationRead);

export default router;
