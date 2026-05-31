import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyReview = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const review = await models.PropertyReview.create({
      property_id: propertyId,
      user_id: data.user_id,
      rating: data.rating,
      review_text: data.review_text,
      is_verified_purchase: data.is_verified_purchase,
      helpful_count: data.helpful_count,
    });

    return review;
  } catch (error) {
    console.error('[createPropertyReview] Error:', error.message);
    throw error;
  }
};

export const getPropertyReviews = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyReview.findAll({
      where: { property_id: propertyId },
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getPropertyReviews] Error:', error.message);
    throw error;
  }
};

export const getPropertyReviewById = async (reviewId) => {
  try {
    const review = await models.PropertyReview.findByPk(reviewId);
    if (!review) throw new AppError('Property review not found', 404);
    return review;
  } catch (error) {
    console.error('[getPropertyReviewById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyReview = async (reviewId, data) => {
  try {
    const review = await models.PropertyReview.findByPk(reviewId);
    if (!review) throw new AppError('Property review not found', 404);

    await review.update(data);
    return review;
  } catch (error) {
    console.error('[updatePropertyReview] Error:', error.message);
    throw error;
  }
};

export const deletePropertyReview = async (reviewId) => {
  try {
    const review = await models.PropertyReview.findByPk(reviewId);
    if (!review) throw new AppError('Property review not found', 404);

    await review.destroy();
  } catch (error) {
    console.error('[deletePropertyReview] Error:', error.message);
    throw error;
  }
};
