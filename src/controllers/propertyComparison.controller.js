import * as service from '../services/propertyComparison.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyComparison = catchAsync(async (req, res) => {
  const comparison = await service.createPropertyComparison(req.params.userId, req.body);
  res.status(201).json({
    success: true,
    message: 'Property comparison created successfully',
    data: comparison,
  });
});

export const getUserPropertyComparisons = catchAsync(async (req, res) => {
  const comparisons = await service.getUserPropertyComparisons(req.params.userId);
  res.json({ success: true, data: comparisons });
});

export const getPropertyComparisonById = catchAsync(async (req, res) => {
  const comparison = await service.getPropertyComparisonById(req.params.comparisonId);
  res.json({ success: true, data: comparison });
});

export const getPropertyComparisonWithDetails = catchAsync(async (req, res) => {
  const comparison = await service.getPropertyComparisonWithDetails(req.params.comparisonId);
  res.json({ success: true, data: comparison });
});

export const updatePropertyComparison = catchAsync(async (req, res) => {
  const comparison = await service.updatePropertyComparison(req.params.comparisonId, req.body);
  res.json({
    success: true,
    message: 'Property comparison updated successfully',
    data: comparison,
  });
});

export const deletePropertyComparison = catchAsync(async (req, res) => {
  await service.deletePropertyComparison(req.params.comparisonId);
  res.json({ success: true, message: 'Property comparison deleted successfully' });
});

export const addPropertyToComparison = catchAsync(async (req, res) => {
  const comparison = await service.addPropertyToComparison(req.params.comparisonId, req.body.property_id);
  res.json({
    success: true,
    message: 'Property added to comparison',
    data: comparison,
  });
});

export const removePropertyFromComparison = catchAsync(async (req, res) => {
  const comparison = await service.removePropertyFromComparison(req.params.comparisonId, req.params.propertyId);
  res.json({
    success: true,
    message: 'Property removed from comparison',
    data: comparison,
  });
});
