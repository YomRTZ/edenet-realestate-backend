import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/* Create a new property */
export const createProperty = async (userId, data) => {
  try {
    const property = await models.Property.create({
      ...data,
      owner_id: userId,
    });
    return property;
  } catch (error) {
    console.error('[createProperty] Error:', error.message);
    throw error;
  }
};

/* Get all properties with pagination and filtering */
export const getProperties = async ({ page = 1, limit = 10, status, listing_type, property_type }) => {
  try {
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (listing_type) where.listing_type = listing_type;
    if (property_type) where.property_type = property_type;
    where.deleted_at = null;

    const { count, rows } = await models.Property.findAndCountAll({
      where,
      include: [{ 
        model: models.User, 
        as: 'owner',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
      }],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      data: rows,
    };
  } catch (error) {
    console.error('[getProperties] Error:', error.message);
    throw error;
  }
};

/* Get property by ID */
export const getPropertyById = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId, {
      include: [{ 
        model: models.User, 
        as: 'owner',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'profile_image']
      }],
    });

    if (!property) throw new AppError('Property not found', 404);
    if (property.deleted_at) throw new AppError('Property has been deleted', 404);

    return property;
  } catch (error) {
    console.error('[getPropertyById] Error:', error.message);
    throw error;
  }
};

/* Update property */
export const updateProperty = async (propertyId, userId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);

    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only update your own properties', 403);
    if (property.deleted_at) throw new AppError('Cannot update a deleted property', 400);

    await property.update(data);
    return property;
  } catch (error) {
    console.error('[updateProperty] Error:', error.message);
    throw error;
  }
};

/* Soft delete property */
export const deleteProperty = async (propertyId, userId) => {
  try {
    const property = await models.Property.findByPk(propertyId);

    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only delete your own properties', 403);

    await property.update({ deleted_at: new Date() });
  } catch (error) {
    console.error('[deleteProperty] Error:', error.message);
    throw error;
  }
};

/* Get user's properties */
export const getUserProperties = async (userId) => {
  try {
    const properties = await models.Property.findAll({
      where: {
        owner_id: userId,
        deleted_at: null,
      },
      order: [['createdAt', 'DESC']],
    });

    return properties;
  } catch (error) {
    console.error('[getUserProperties] Error:', error.message);
    throw error;
  }
};
