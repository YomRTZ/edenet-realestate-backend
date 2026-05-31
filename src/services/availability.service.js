import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createAvailability = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const availability = await models.Availability.create({
      property_id: propertyId,
      start_date: data.start_date,
      end_date: data.end_date,
      is_available: data.is_available ?? true,
      blocked_reason: data.blocked_reason,
    });

    return availability;
  } catch (error) {
    console.error('[createAvailability] Error:', error.message);
    throw error;
  }
};

export const getAvailabilities = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.Availability.findAll({
      where: { property_id: propertyId },
      order: [['start_date', 'ASC']],
    });
  } catch (error) {
    console.error('[getAvailabilities] Error:', error.message);
    throw error;
  }
};

export const getAvailabilityById = async (availabilityId) => {
  try {
    const availability = await models.Availability.findByPk(availabilityId);
    if (!availability) throw new AppError('Availability record not found', 404);
    return availability;
  } catch (error) {
    console.error('[getAvailabilityById] Error:', error.message);
    throw error;
  }
};

export const updateAvailability = async (availabilityId, data) => {
  try {
    const availability = await models.Availability.findByPk(availabilityId);
    if (!availability) throw new AppError('Availability record not found', 404);

    await availability.update(data);
    return availability;
  } catch (error) {
    console.error('[updateAvailability] Error:', error.message);
    throw error;
  }
};

export const deleteAvailability = async (availabilityId) => {
  try {
    const availability = await models.Availability.findByPk(availabilityId);
    if (!availability) throw new AppError('Availability record not found', 404);

    await availability.destroy();
  } catch (error) {
    console.error('[deleteAvailability] Error:', error.message);
    throw error;
  }
};
