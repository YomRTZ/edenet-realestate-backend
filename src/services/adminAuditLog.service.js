import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createAuditLog = async (adminId, data) => {
  const admin = await models.User.findByPk(adminId);
  if (!admin) throw new AppError('Admin user not found', 404);

  const log = await models.AdminAuditLog.create({
    admin_id: adminId,
    action_type: data.action_type,
    entity_type: data.entity_type,
    entity_id: data.entity_id,
    old_value: data.old_value || null,
    new_value: data.new_value || null,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
  });

  return log;
};

export const getAuditLogById = async (id) => {
  const log = await models.AdminAuditLog.findByPk(id);
  if (!log) throw new AppError('Audit log not found', 404);
  return log;
};

export const listAuditLogs = async (filters = {}) => {
  const where = {};
  if (filters.admin_id) where.admin_id = filters.admin_id;
  if (filters.entity_type) where.entity_type = filters.entity_type;
  if (filters.entity_id) where.entity_id = filters.entity_id;
  if (filters.action_type) where.action_type = filters.action_type;

  const limit = parseInt(filters.limit, 10) || 100;
  const offset = parseInt(filters.offset, 10) || 0;

  return await models.AdminAuditLog.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
};

export const getAuditLogsByAdmin = async (adminId, options = {}) => {
  const admin = await models.User.findByPk(adminId);
  if (!admin) throw new AppError('Admin user not found', 404);

  const limit = parseInt(options.limit, 10) || 100;
  const offset = parseInt(options.offset, 10) || 0;

  return await models.AdminAuditLog.findAll({
    where: { admin_id: adminId },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
};

export const deleteAuditLog = async (id) => {
  const log = await models.AdminAuditLog.findByPk(id);
  if (!log) throw new AppError('Audit log not found', 404);
  await log.destroy();
};
