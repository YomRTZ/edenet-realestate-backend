import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createShowing = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const showing = await models.Showing.create({
      property_id: propertyId,
      requester_id: data.requester_id,
      agent_id: data.agent_id,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes,
      status: data.status,
      notes: data.notes,
      feedback: data.feedback,
    });

    return showing;
  } catch (error) {
    console.error('[createShowing] Error:', error.message);
    throw error;
  }
};

export const getShowings = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.Showing.findAll({
      where: { property_id: propertyId },
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getShowings] Error:', error.message);
    throw error;
  }
};

export const getShowingById = async (showingId) => {
  try {
    const showing = await models.Showing.findByPk(showingId);
    if (!showing) throw new AppError('Showing appointment not found', 404);
    return showing;
  } catch (error) {
    console.error('[getShowingById] Error:', error.message);
    throw error;
  }
};

export const updateShowing = async (showingId, data) => {
  try {
    const showing = await models.Showing.findByPk(showingId);
    if (!showing) throw new AppError('Showing appointment not found', 404);

    await showing.update(data);
    return showing;
  } catch (error) {
    console.error('[updateShowing] Error:', error.message);
    throw error;
  }
};

export const deleteShowing = async (showingId) => {
  try {
    const showing = await models.Showing.findByPk(showingId);
    if (!showing) throw new AppError('Showing appointment not found', 404);

    await showing.destroy();
  } catch (error) {
    console.error('[deleteShowing] Error:', error.message);
    throw error;
  }
};
