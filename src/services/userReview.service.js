import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createUserReview = async (revieweeId, data) => {
  try {
    const reviewee = await models.User.findByPk(revieweeId);
    if (!reviewee) throw new AppError('Reviewee not found', 404);

    const review = await models.UserReview.create({
      reviewer_id: data.reviewer_id,
      reviewee_id: revieweeId,
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

    return await models.UserReview.findAll({
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
    const review = await models.UserReview.findByPk(reviewId);
    if (!review) throw new AppError('User review not found', 404);
    return review;
  } catch (error) {
    console.error('[getUserReviewById] Error:', error.message);
    throw error;
  }
};

export const updateUserReview = async (reviewId, data) => {
  try {
    const review = await models.UserReview.findByPk(reviewId);
    if (!review) throw new AppError('User review not found', 404);

    await review.update(data);
    return review;
  } catch (error) {
    console.error('[updateUserReview] Error:', error.message);
    throw error;
  }
};

export const deleteUserReview = async (reviewId) => {
  try {
    const review = await models.UserReview.findByPk(reviewId);
    if (!review) throw new AppError('User review not found', 404);

    await review.destroy();
  } catch (error) {
    console.error('[deleteUserReview] Error:', error.message);
    throw error;
  }
};
