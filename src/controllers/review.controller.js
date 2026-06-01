import * as service from '../services/review.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createUserReview = catchAsync(async (req, res) => {
  const review = await service.createUserReview(req.params.revieweeId, req.body);
  res.status(201).json({ success: true, message: 'User review created successfully', data: review });
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
  res.json({ success: true, message: 'User review updated successfully', data: review });
});

export const deleteUserReview = catchAsync(async (req, res) => {
  await service.deleteUserReview(req.params.reviewId);
  res.json({ success: true, message: 'User review deleted successfully' });
});

export const createPropertyReview = catchAsync(async (req, res) => {
  const review = await service.createPropertyReview(req.params.propertyId, req.body);
  res.status(201).json({ success: true, message: 'Property review created successfully', data: review });
});

export const getPropertyReviews = catchAsync(async (req, res) => {
  const reviews = await service.getPropertyReviews(req.params.propertyId);
  res.json({ success: true, data: reviews });
});

export const getPropertyReviewById = catchAsync(async (req, res) => {
  const review = await service.getPropertyReviewById(req.params.reviewId);
  res.json({ success: true, data: review });
});

export const updatePropertyReview = catchAsync(async (req, res) => {
  const review = await service.updatePropertyReview(req.params.reviewId, req.body);
  res.json({ success: true, message: 'Property review updated successfully', data: review });
});

export const deletePropertyReview = catchAsync(async (req, res) => {
  await service.deletePropertyReview(req.params.reviewId);
  res.json({ success: true, message: 'Property review deleted successfully' });
});
