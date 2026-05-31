import * as service from '../services/savedSearch.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createSavedSearch = catchAsync(async (req, res) => {
  const savedSearch = await service.createSavedSearch(req.params.userId, req.body);
  res.status(201).json({
    success: true,
    message: 'Saved search created successfully',
    data: savedSearch,
  });
});

export const getUserSavedSearches = catchAsync(async (req, res) => {
  const savedSearches = await service.getUserSavedSearches(req.params.userId);
  res.json({ success: true, data: savedSearches });
});

export const getSavedSearchById = catchAsync(async (req, res) => {
  const savedSearch = await service.getSavedSearchById(req.params.searchId);
  res.json({ success: true, data: savedSearch });
});

export const updateSavedSearch = catchAsync(async (req, res) => {
  const savedSearch = await service.updateSavedSearch(req.params.searchId, req.body);
  res.json({
    success: true,
    message: 'Saved search updated successfully',
    data: savedSearch,
  });
});

export const deleteSavedSearch = catchAsync(async (req, res) => {
  await service.deleteSavedSearch(req.params.searchId);
  res.json({ success: true, message: 'Saved search deleted successfully' });
});

export const getActiveSavedSearchesByFrequency = catchAsync(async (req, res) => {
  const savedSearches = await service.getActiveSavedSearchesByFrequency(req.params.frequency);
  res.json({ success: true, data: savedSearches });
});
