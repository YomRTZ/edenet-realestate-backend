import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyOwnership = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const ownership = await models.PropertyOwnership.create({
      property_id: propertyId,
      owner_id: data.owner_id,
      ownership_percentage: data.ownership_percentage ?? 100,
      deed_number: data.deed_number,
      start_date: data.start_date,
      end_date: data.end_date,
      is_current: data.is_current ?? true,
    });

    return ownership;
  } catch (error) {
    console.error('[createPropertyOwnership] Error:', error.message);
    throw error;
  }
};

export const getPropertyOwnerships = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyOwnership.findAll({
      where: { property_id: propertyId },
      order: [['createdAt', 'ASC']],
    });
  } catch (error) {
    console.error('[getPropertyOwnerships] Error:', error.message);
    throw error;
  }
};

export const getPropertyOwnershipById = async (ownershipId) => {
  try {
    const ownership = await models.PropertyOwnership.findByPk(ownershipId);
    if (!ownership) throw new AppError('Ownership record not found', 404);
    return ownership;
  } catch (error) {
    console.error('[getPropertyOwnershipById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyOwnership = async (ownershipId, data) => {
  try {
    const ownership = await models.PropertyOwnership.findByPk(ownershipId);
    if (!ownership) throw new AppError('Ownership record not found', 404);

    if (data.owner_id !== undefined) ownership.owner_id = data.owner_id;
    if (data.ownership_percentage !== undefined) ownership.ownership_percentage = data.ownership_percentage;
    if (data.deed_number !== undefined) ownership.deed_number = data.deed_number;
    if (data.start_date !== undefined) ownership.start_date = data.start_date;
    if (data.end_date !== undefined) ownership.end_date = data.end_date;
    if (data.is_current !== undefined) ownership.is_current = data.is_current;

    await ownership.save();
    return ownership;
  } catch (error) {
    console.error('[updatePropertyOwnership] Error:', error.message);
    throw error;
  }
};

export const deletePropertyOwnership = async (ownershipId) => {
  try {
    const ownership = await models.PropertyOwnership.findByPk(ownershipId);
    if (!ownership) throw new AppError('Ownership record not found', 404);

    await ownership.destroy();
  } catch (error) {
    console.error('[deletePropertyOwnership] Error:', error.message);
    throw error;
  }
};
