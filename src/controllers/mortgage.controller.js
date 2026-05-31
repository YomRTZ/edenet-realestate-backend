import * as service from '../services/mortgage.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createMortgage = catchAsync(async (req, res) => {
  const mortgage = await service.createMortgage(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Mortgage created successfully',
    data: mortgage,
  });
});

export const getMortgages = catchAsync(async (req, res) => {
  const mortgages = await service.getMortgages(req.params.propertyId);
  res.json({ success: true, data: mortgages });
});

export const getMortgageById = catchAsync(async (req, res) => {
  const mortgage = await service.getMortgageById(req.params.mortgageId);
  res.json({ success: true, data: mortgage });
});

export const updateMortgage = catchAsync(async (req, res) => {
  const mortgage = await service.updateMortgage(req.params.mortgageId, req.body);
  res.json({
    success: true,
    message: 'Mortgage updated successfully',
    data: mortgage,
  });
});

export const deleteMortgage = catchAsync(async (req, res) => {
  await service.deleteMortgage(req.params.mortgageId);
  res.json({ success: true, message: 'Mortgage deleted successfully' });
});
