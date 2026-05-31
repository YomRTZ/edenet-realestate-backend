import * as service from '../services/adminAuditLog.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createAuditLog = catchAsync(async (req, res) => {
  const adminId = req.params.adminId;
  const log = await service.createAuditLog(adminId, req.body);
  res.status(201).json({ success: true, message: 'Audit log created', data: log });
});

export const getAuditLogById = catchAsync(async (req, res) => {
  const log = await service.getAuditLogById(req.params.auditLogId);
  res.json({ success: true, data: log });
});

export const listAuditLogs = catchAsync(async (req, res) => {
  const logs = await service.listAuditLogs(req.query);
  res.json({ success: true, data: logs });
});

export const getAuditLogsByAdmin = catchAsync(async (req, res) => {
  const logs = await service.getAuditLogsByAdmin(req.params.adminId, req.query);
  res.json({ success: true, data: logs });
});

export const deleteAuditLog = catchAsync(async (req, res) => {
  await service.deleteAuditLog(req.params.auditLogId);
  res.json({ success: true, message: 'Audit log deleted' });
});
