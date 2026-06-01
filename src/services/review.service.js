import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const getReviewById = async (reviewId) => {
  const review = await models.Review.findByPk(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  return review;
};

export const createUserReview = async (revieweeId, data) => {
  try {
    const reviewee = await models.User.findByPk(revieweeId);
    if (!reviewee) throw new AppError('Reviewee not found', 404);

    const review = await models.Review.create({
      reviewer_id: data.reviewer_id ?? data.user_id,
      reviewee_id: revieweeId,
      property_id: null,
      transaction_type: data.transaction_type,
      transaction_id: data.transaction_id,
      rating: data.rating,
      review_text: data.review_text,
    });

    return review;
  } catch (error) {
    console.error('[createUserReview] Error:', error.message);
    throw error;
  }
};

export const getUserReviews = async (revieweeId) => {
  try {
    const reviewee = await models.User.findByPk(revieweeId);
    if (!reviewee) throw new AppError('Reviewee not found', 404);

    return await models.Review.findAll({
      where: { reviewee_id: revieweeId },
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getUserReviews] Error:', error.message);
    throw error;
  }
};

export const getUserReviewById = async (reviewId) => {
  try {
    return await getReviewById(reviewId);
  } catch (error) {
    console.error('[getUserReviewById] Error:', error.message);
    throw error;
  }
};

export const updateUserReview = async (reviewId, data) => {
  try {
    const review = await getReviewById(reviewId);
    if (!review.reviewee_id) throw new AppError('Review is not a user review', 400);

    await review.update({
      reviewer_id: data.reviewer_id ?? data.user_id,
      transaction_type: data.transaction_type,
      transaction_id: data.transaction_id,
      rating: data.rating,
      review_text: data.review_text,
    });

    return review;
  } catch (error) {
    console.error('[updateUserReview] Error:', error.message);
    throw error;
  }
};

export const deleteUserReview = async (reviewId) => {
  try {
    const review = await getReviewById(reviewId);
    if (!review.reviewee_id) throw new AppError('Review is not a user review', 400);

    await review.destroy();
  } catch (error) {
    console.error('[deleteUserReview] Error:', error.message);
    throw error;
  }
};

export const createPropertyReview = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const review = await models.Review.create({
      reviewer_id: data.reviewer_id ?? data.user_id,
      reviewee_id: null,
      property_id: propertyId,
      rating: data.rating,
      review_text: data.review_text,
      is_verified_purchase: data.is_verified_purchase ?? false,
      helpful_count: data.helpful_count ?? 0,
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

    return await models.Review.findAll({
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
    return await getReviewById(reviewId);
  } catch (error) {
    console.error('[getPropertyReviewById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyReview = async (reviewId, data) => {
  try {
    const review = await getReviewById(reviewId);
    if (!review.property_id) throw new AppError('Review is not a property review', 400);

    await review.update({
      reviewer_id: data.reviewer_id ?? data.user_id,
      rating: data.rating,
      review_text: data.review_text,
      is_verified_purchase: data.is_verified_purchase,
      helpful_count: data.helpful_count,
    });

    return review;
  } catch (error) {
    console.error('[updatePropertyReview] Error:', error.message);
    throw error;
  }
};

export const deletePropertyReview = async (reviewId) => {
  try {
    const review = await getReviewById(reviewId);
    if (!review.property_id) throw new AppError('Review is not a property review', 400);

    await review.destroy();
  } catch (error) {
    console.error('[deletePropertyReview] Error:', error.message);
    throw error;
  }
};
