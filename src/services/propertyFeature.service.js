import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyFeature = async (propertyId, userId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only add features to your own properties', 403);
    if (property.deleted_at) throw new AppError('Cannot add features to a deleted property', 400);

    const feature = await models.PropertyFeature.create({
      property_id: propertyId,
      feature_name: data.feature_name,
      feature_value: data.feature_value,
    });

    return feature;
  } catch (error) {
    console.error('[createPropertyFeature] Error:', error.message);
    throw error;
  }
};

export const getPropertyFeatures = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyFeature.findAll({
      where: { property_id: propertyId },
      order: [['createdAt', 'ASC']],
    });
  } catch (error) {
    console.error('[getPropertyFeatures] Error:', error.message);
    throw error;
  }
};

export const getPropertyFeatureById = async (featureId) => {
  try {
    const feature = await models.PropertyFeature.findByPk(featureId);
    if (!feature) throw new AppError('Feature not found', 404);
    return feature;
  } catch (error) {
    console.error('[getPropertyFeatureById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyFeature = async (featureId, userId, data) => {
  try {
    const feature = await models.PropertyFeature.findByPk(featureId);
    if (!feature) throw new AppError('Feature not found', 404);

    const property = await models.Property.findByPk(feature.property_id);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only update features for your own properties', 403);

    if (data.feature_name !== undefined) feature.feature_name = data.feature_name;
    if (data.feature_value !== undefined) feature.feature_value = data.feature_value;

    await feature.save();
    return feature;
  } catch (error) {
    console.error('[updatePropertyFeature] Error:', error.message);
    throw error;
  }
};

export const deletePropertyFeature = async (featureId, userId) => {
  try {
    const feature = await models.PropertyFeature.findByPk(featureId);
    if (!feature) throw new AppError('Feature not found', 404);

    const property = await models.Property.findByPk(feature.property_id);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only delete features from your own properties', 403);

    await feature.destroy();
  } catch (error) {
    console.error('[deletePropertyFeature] Error:', error.message);
    throw error;
  }
};
