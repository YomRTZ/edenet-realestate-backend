import * as service from '../services/showing.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createShowing = catchAsync(async (req, res) => {
  const showing = await service.createShowing(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Showing appointment created successfully',
    data: showing,
  });
});

export const getShowings = catchAsync(async (req, res) => {
  const showings = await service.getShowings(req.params.propertyId);
  res.json({ success: true, data: showings });
});

export const getShowingById = catchAsync(async (req, res) => {
  const showing = await service.getShowingById(req.params.showingId);
  res.json({ success: true, data: showing });
});

export const updateShowing = catchAsync(async (req, res) => {
  const showing = await service.updateShowing(req.params.showingId, req.body);
  res.json({
    success: true,
    message: 'Showing appointment updated successfully',
    data: showing,
  });
});

export const deleteShowing = catchAsync(async (req, res) => {
  await service.deleteShowing(req.params.showingId);
  res.json({ success: true, message: 'Showing appointment deleted successfully' });
});
