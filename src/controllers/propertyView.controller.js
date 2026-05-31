import * as service from '../services/propertyView.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyView = catchAsync(async (req, res) => {
  const view = await service.createPropertyView(req.params.propertyId, req.body);
  res.status(201).json({ success: true, message: 'View recorded', data: view });
});

export const getPropertyViews = catchAsync(async (req, res) => {
  const views = await service.getPropertyViews(req.params.propertyId, req.query);
  res.json({ success: true, data: views });
});

export const getUserViews = catchAsync(async (req, res) => {
  const views = await service.getUserViews(req.params.userId, req.query);
  res.json({ success: true, data: views });
});
