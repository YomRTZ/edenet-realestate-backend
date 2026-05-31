import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createMaintenanceRequest = async (propertyId, agreementId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const agreement = await models.RentalAgreement.findByPk(agreementId);
    if (!agreement) throw new AppError('Rental agreement not found', 404);
    if (agreement.property_id !== propertyId) throw new AppError('Agreement does not belong to the specified property', 400);

    const maintenanceRequest = await models.MaintenanceRequest.create({
      rental_agreement_id: agreementId,
      tenant_id: data.tenant_id,
      property_id: propertyId,
      issue_type: data.issue_type,
      priority: data.priority,
      description: data.description,
      photos_url: data.photos_url,
      status: data.status,
      assigned_to: data.assigned_to,
      estimated_cost: data.estimated_cost,
      actual_cost: data.actual_cost,
      completed_at: data.completed_at,
    });

    return maintenanceRequest;
  } catch (error) {
    console.error('[createMaintenanceRequest] Error:', error.message);
    throw error;
  }
};

export const getMaintenanceRequests = async (propertyId, agreementId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const agreement = await models.RentalAgreement.findByPk(agreementId);
    if (!agreement) throw new AppError('Rental agreement not found', 404);
    if (agreement.property_id !== propertyId) throw new AppError('Agreement does not belong to the specified property', 400);

    return await models.MaintenanceRequest.findAll({
      where: { rental_agreement_id: agreementId, property_id: propertyId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('[getMaintenanceRequests] Error:', error.message);
    throw error;
  }
};

export const getMaintenanceRequestById = async (requestId) => {
  try {
    const maintenanceRequest = await models.MaintenanceRequest.findByPk(requestId);
    if (!maintenanceRequest) throw new AppError('Maintenance request not found', 404);
    return maintenanceRequest;
  } catch (error) {
    console.error('[getMaintenanceRequestById] Error:', error.message);
    throw error;
  }
};

export const updateMaintenanceRequest = async (requestId, data) => {
  try {
    const maintenanceRequest = await models.MaintenanceRequest.findByPk(requestId);
    if (!maintenanceRequest) throw new AppError('Maintenance request not found', 404);

    await maintenanceRequest.update(data);
    return maintenanceRequest;
  } catch (error) {
    console.error('[updateMaintenanceRequest] Error:', error.message);
    throw error;
  }
};

export const deleteMaintenanceRequest = async (requestId) => {
  try {
    const maintenanceRequest = await models.MaintenanceRequest.findByPk(requestId);
    if (!maintenanceRequest) throw new AppError('Maintenance request not found', 404);

    await maintenanceRequest.destroy();
  } catch (error) {
    console.error('[deleteMaintenanceRequest] Error:', error.message);
    throw error;
  }
};
