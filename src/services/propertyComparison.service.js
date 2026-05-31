import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyComparison = async (userId, data) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    // Validate that all properties exist
    if (data.property_ids && data.property_ids.length > 0) {
      const properties = await models.Property.findAll({
        where: { id: data.property_ids },
      });

      if (properties.length !== data.property_ids.length) {
        throw new AppError('Some properties not found', 404);
      }
    }

    const comparison = await models.PropertyComparison.create({
      user_id: userId,
      name: data.name || null,
      property_ids: data.property_ids,
    });

    return comparison;
  } catch (error) {
    console.error('[createPropertyComparison] Error:', error.message);
    throw error;
  }
};

export const getUserPropertyComparisons = async (userId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    return await models.PropertyComparison.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getUserPropertyComparisons] Error:', error.message);
    throw error;
  }
};

export const getPropertyComparisonById = async (comparisonId) => {
  try {
    const comparison = await models.PropertyComparison.findByPk(comparisonId);
    if (!comparison) throw new AppError('Property comparison not found', 404);
    return comparison;
  } catch (error) {
    console.error('[getPropertyComparisonById] Error:', error.message);
    throw error;
  }
};

export const getPropertyComparisonWithDetails = async (comparisonId) => {
  try {
    const comparison = await models.PropertyComparison.findByPk(comparisonId);
    if (!comparison) throw new AppError('Property comparison not found', 404);

    // Fetch all properties in this comparison
    const properties = await models.Property.findAll({
      where: { id: comparison.property_ids },
      attributes: ['id', 'title', 'description', 'price', 'property_type', 'listing_type', 'bedrooms', 'bathrooms', 'area_size', 'address', 'city', 'state'],
    });

    return {
      ...comparison.toJSON(),
      properties,
    };
  } catch (error) {
    console.error('[getPropertyComparisonWithDetails] Error:', error.message);
    throw error;
  }
};

export const updatePropertyComparison = async (comparisonId, data) => {
  try {
    const comparison = await models.PropertyComparison.findByPk(comparisonId);
    if (!comparison) throw new AppError('Property comparison not found', 404);

    // Validate that all properties exist if property_ids is being updated
    if (data.property_ids && data.property_ids.length > 0) {
      const properties = await models.Property.findAll({
        where: { id: data.property_ids },
      });

      if (properties.length !== data.property_ids.length) {
        throw new AppError('Some properties not found', 404);
      }
    }

    await comparison.update(data);
    return comparison;
  } catch (error) {
    console.error('[updatePropertyComparison] Error:', error.message);
    throw error;
  }
};

export const deletePropertyComparison = async (comparisonId) => {
  try {
    const comparison = await models.PropertyComparison.findByPk(comparisonId);
    if (!comparison) throw new AppError('Property comparison not found', 404);

    await comparison.destroy();
  } catch (error) {
    console.error('[deletePropertyComparison] Error:', error.message);
    throw error;
  }
};

export const addPropertyToComparison = async (comparisonId, propertyId) => {
  try {
    const comparison = await models.PropertyComparison.findByPk(comparisonId);
    if (!comparison) throw new AppError('Property comparison not found', 404);

    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    // Check if property already in comparison
    if (comparison.property_ids.includes(propertyId)) {
      throw new AppError('Property already in comparison', 409);
    }

    const updatedIds = [...comparison.property_ids, propertyId];
    await comparison.update({ property_ids: updatedIds });

    return comparison;
  } catch (error) {
    console.error('[addPropertyToComparison] Error:', error.message);
    throw error;
  }
};

export const removePropertyFromComparison = async (comparisonId, propertyId) => {
  try {
    const comparison = await models.PropertyComparison.findByPk(comparisonId);
    if (!comparison) throw new AppError('Property comparison not found', 404);

    if (!comparison.property_ids.includes(propertyId)) {
      throw new AppError('Property not in comparison', 404);
    }

    const updatedIds = comparison.property_ids.filter((id) => id !== propertyId);
    await comparison.update({ property_ids: updatedIds });

    return comparison;
  } catch (error) {
    console.error('[removePropertyFromComparison] Error:', error.message);
    throw error;
  }
};
