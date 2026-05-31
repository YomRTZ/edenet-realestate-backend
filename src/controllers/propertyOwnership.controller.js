import * as service from '../services/propertyOwnership.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyOwnership = catchAsync(async (req, res) => {
  const ownership = await service.createPropertyOwnership(req.params.propertyId, req.body);
  res.status(201).json({ success: true, message: 'Ownership record created successfully', data: ownership });
});

export const getPropertyOwnerships = catchAsync(async (req, res) => {
  const ownerships = await service.getPropertyOwnerships(req.params.propertyId);
  res.json({ success: true, data: ownerships });
});

export const getPropertyOwnershipById = catchAsync(async (req, res) => {
  const ownership = await service.getPropertyOwnershipById(req.params.ownershipId);
  res.json({ success: true, data: ownership });
});

export const updatePropertyOwnership = catchAsync(async (req, res) => {
  const ownership = await service.updatePropertyOwnership(req.params.ownershipId, req.body);
  res.json({ success: true, message: 'Ownership record updated successfully', data: ownership });
});

export const deletePropertyOwnership = catchAsync(async (req, res) => {
  await service.deletePropertyOwnership(req.params.ownershipId);
  res.json({ success: true, message: 'Ownership record deleted successfully' });
});
