import * as service from '../services/propertyFeature.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyFeature = catchAsync(async (req, res) => {
  const feature = await service.createPropertyFeature(req.params.propertyId, req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Feature created successfully', data: feature });
});

export const getPropertyFeatures = catchAsync(async (req, res) => {
  const features = await service.getPropertyFeatures(req.params.propertyId);
  res.json({ success: true, data: features });
});

export const getPropertyFeatureById = catchAsync(async (req, res) => {
  const feature = await service.getPropertyFeatureById(req.params.featureId);
  res.json({ success: true, data: feature });
});

export const updatePropertyFeature = catchAsync(async (req, res) => {
  const feature = await service.updatePropertyFeature(req.params.featureId, req.user.id, req.body);
  res.json({ success: true, message: 'Feature updated successfully', data: feature });
});

export const deletePropertyFeature = catchAsync(async (req, res) => {
  await service.deletePropertyFeature(req.params.featureId, req.user.id);
  res.json({ success: true, message: 'Feature deleted successfully' });
});
