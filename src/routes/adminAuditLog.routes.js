import express from 'express';
import * as controller from '../controllers/adminAuditLog.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAdminAuditLogSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/admin/:adminId/audit-logs', verifyToken, validate(createAdminAuditLogSchema), controller.createAuditLog);
router.get('/admin/:adminId/audit-logs', verifyToken, controller.getAuditLogsByAdmin);
router.get('/admin/audit-logs', verifyToken, controller.listAuditLogs);
router.get('/admin/audit-logs/:auditLogId', verifyToken, controller.getAuditLogById);
router.delete('/admin/audit-logs/:auditLogId', verifyToken, controller.deleteAuditLog);

export default router;
