import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const addFavorite = async (userId, propertyId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const existingFavorite = await models.Favorite.findOne({
      where: { user_id: userId, property_id: propertyId },
    });

    if (existingFavorite) {
      throw new AppError('Property already in favorites', 409);
    }

    const favorite = await models.Favorite.create({
      user_id: userId,
      property_id: propertyId,
    });

    return favorite;
  } catch (error) {
    console.error('[addFavorite] Error:', error.message);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    return await models.Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: models.Property,
          as: 'property',
          attributes: ['id', 'title', 'description', 'price', 'property_type', 'listing_type', 'address', 'city', 'state', 'latitude', 'longitude'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getUserFavorites] Error:', error.message);
    throw error;
  }
};

export const getPropertyFavorites = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.Favorite.findAll({
      where: { property_id: propertyId },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name', 'profile_image'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getPropertyFavorites] Error:', error.message);
    throw error;
  }
};

export const removeFavorite = async (userId, propertyId) => {
  try {
    const favorite = await models.Favorite.findOne({
      where: { user_id: userId, property_id: propertyId },
    });

    if (!favorite) throw new AppError('Favorite not found', 404);

    await favorite.destroy();
  } catch (error) {
    console.error('[removeFavorite] Error:', error.message);
    throw error;
  }
};

export const isFavorited = async (userId, propertyId) => {
  try {
    const favorite = await models.Favorite.findOne({
      where: { user_id: userId, property_id: propertyId },
    });

    return !!favorite;
  } catch (error) {
    console.error('[isFavorited] Error:', error.message);
    throw error;
  }
};
