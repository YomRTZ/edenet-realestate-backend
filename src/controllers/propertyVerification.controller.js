import * as service from '../services/propertyVerification.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyVerification = catchAsync(async (req, res) => {
  const record = await service.createPropertyVerification(req.params.propertyId, req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Verification record created successfully', data: record });
});

export const getPropertyVerifications = catchAsync(async (req, res) => {
  const records = await service.getPropertyVerifications(req.params.propertyId);
  res.json({ success: true, data: records });
});

export const getPropertyVerificationById = catchAsync(async (req, res) => {
  const record = await service.getPropertyVerificationById(req.params.verificationId);
  res.json({ success: true, data: record });
});

export const updatePropertyVerification = catchAsync(async (req, res) => {
  const record = await service.updatePropertyVerification(req.params.verificationId, req.user.id, req.body);
  res.json({ success: true, message: 'Verification record updated successfully', data: record });
});

export const deletePropertyVerification = catchAsync(async (req, res) => {
  await service.deletePropertyVerification(req.params.verificationId, req.user.id);
  res.json({ success: true, message: 'Verification record deleted successfully' });
});
