import * as service from '../services/propertyReview.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyReview = catchAsync(async (req, res) => {
  const review = await service.createPropertyReview(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Property review created successfully',
    data: review,
  });
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
  res.json({
    success: true,
    message: 'Property review updated successfully',
    data: review,
  });
});

export const deletePropertyReview = catchAsync(async (req, res) => {
  await service.deletePropertyReview(req.params.reviewId);
  res.json({ success: true, message: 'Property review deleted successfully' });
});
