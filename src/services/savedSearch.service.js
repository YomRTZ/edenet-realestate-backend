import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createSavedSearch = async (userId, data) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const savedSearch = await models.SavedSearch.create({
      user_id: userId,
      search_name: data.search_name,
      filters: data.filters,
      alert_frequency: data.alert_frequency || 'IMMEDIATE',
      is_active: data.is_active !== false,
    });

    return savedSearch;
  } catch (error) {
    console.error('[createSavedSearch] Error:', error.message);
    throw error;
  }
};

export const getUserSavedSearches = async (userId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    return await models.SavedSearch.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getUserSavedSearches] Error:', error.message);
    throw error;
  }
};

export const getSavedSearchById = async (searchId) => {
  try {
    const savedSearch = await models.SavedSearch.findByPk(searchId);
    if (!savedSearch) throw new AppError('Saved search not found', 404);
    return savedSearch;
  } catch (error) {
    console.error('[getSavedSearchById] Error:', error.message);
    throw error;
  }
};

export const updateSavedSearch = async (searchId, data) => {
  try {
    const savedSearch = await models.SavedSearch.findByPk(searchId);
    if (!savedSearch) throw new AppError('Saved search not found', 404);

    await savedSearch.update(data);
    return savedSearch;
  } catch (error) {
    console.error('[updateSavedSearch] Error:', error.message);
    throw error;
  }
};

export const deleteSavedSearch = async (searchId) => {
  try {
    const savedSearch = await models.SavedSearch.findByPk(searchId);
    if (!savedSearch) throw new AppError('Saved search not found', 404);

    await savedSearch.destroy();
  } catch (error) {
    console.error('[deleteSavedSearch] Error:', error.message);
    throw error;
  }
};

export const getActiveSavedSearchesByFrequency = async (frequency) => {
  try {
    return await models.SavedSearch.findAll({
      where: {
        is_active: true,
        alert_frequency: frequency,
      },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name'],
        },
      ],
    });
  } catch (error) {
    console.error('[getActiveSavedSearchesByFrequency] Error:', error.message);
    throw error;
  }
};

export const updateLastTriggeredAt = async (searchId) => {
  try {
    const savedSearch = await models.SavedSearch.findByPk(searchId);
    if (!savedSearch) throw new AppError('Saved search not found', 404);

    await savedSearch.update({
      last_triggered_at: new Date(),
    });

    return savedSearch;
  } catch (error) {
    console.error('[updateLastTriggeredAt] Error:', error.message);
    throw error;
  }
};
