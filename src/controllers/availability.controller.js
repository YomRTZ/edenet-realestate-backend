import * as service from '../services/availability.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createAvailability = catchAsync(async (req, res) => {
  const availability = await service.createAvailability(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Availability record created successfully',
    data: availability,
  });
});

export const getAvailabilities = catchAsync(async (req, res) => {
  const availabilities = await service.getAvailabilities(req.params.propertyId);
  res.json({ success: true, data: availabilities });
});

export const getAvailabilityById = catchAsync(async (req, res) => {
  const availability = await service.getAvailabilityById(req.params.availabilityId);
  res.json({ success: true, data: availability });
});

export const updateAvailability = catchAsync(async (req, res) => {
  const availability = await service.updateAvailability(req.params.availabilityId, req.body);
  res.json({
    success: true,
    message: 'Availability record updated successfully',
    data: availability,
  });
});

export const deleteAvailability = catchAsync(async (req, res) => {
  await service.deleteAvailability(req.params.availabilityId);
  res.json({ success: true, message: 'Availability record deleted successfully' });
});
