import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyView = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const view = await models.PropertyView.create({
      property_id: propertyId,
      user_id: data.user_id || null,
      ip_address: data.ip_address || null,
    });

    return view;
  } catch (error) {
    console.error('[createPropertyView] Error:', error.message);
    throw error;
  }
};

export const getPropertyViews = async (propertyId, options = {}) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyView.findAll({
      where: { property_id: propertyId },
      order: [['viewed_at', 'DESC']],
      limit: options.limit || 100,
      offset: options.offset || 0,
    });
  } catch (error) {
    console.error('[getPropertyViews] Error:', error.message);
    throw error;
  }
};

export const getUserViews = async (userId, options = {}) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    return await models.PropertyView.findAll({
      where: { user_id: userId },
      order: [['viewed_at', 'DESC']],
      limit: options.limit || 100,
      offset: options.offset || 0,
      include: [
        {
          model: models.Property,
          as: 'property',
          attributes: ['id', 'title', 'price', 'city', 'state'],
        },
      ],
    });
  } catch (error) {
    console.error('[getUserViews] Error:', error.message);
    throw error;
  }
};
