import * as service from '../services/userReview.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createUserReview = catchAsync(async (req, res) => {
  const review = await service.createUserReview(req.params.revieweeId, req.body);
  res.status(201).json({
    success: true,
    message: 'User review created successfully',
    data: review,
  });
});

export const getUserReviews = catchAsync(async (req, res) => {
  const reviews = await service.getUserReviews(req.params.revieweeId);
  res.json({ success: true, data: reviews });
});

export const getUserReviewById = catchAsync(async (req, res) => {
  const review = await service.getUserReviewById(req.params.reviewId);
  res.json({ success: true, data: review });
});

export const updateUserReview = catchAsync(async (req, res) => {
  const review = await service.updateUserReview(req.params.reviewId, req.body);
  res.json({
    success: true,
    message: 'User review updated successfully',
    data: review,
  });
});

export const deleteUserReview = catchAsync(async (req, res) => {
  await service.deleteUserReview(req.params.reviewId);
  res.json({ success: true, message: 'User review deleted successfully' });
});
