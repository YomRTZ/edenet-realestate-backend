import * as service from '../services/propertyTax.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyTax = catchAsync(async (req, res) => {
  const propertyTax = await service.createPropertyTax(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Property tax record created successfully',
    data: propertyTax,
  });
});

export const getPropertyTaxes = catchAsync(async (req, res) => {
  const propertyTaxes = await service.getPropertyTaxes(req.params.propertyId);
  res.json({ success: true, data: propertyTaxes });
});

export const getPropertyTaxById = catchAsync(async (req, res) => {
  const propertyTax = await service.getPropertyTaxById(req.params.taxId);
  res.json({ success: true, data: propertyTax });
});

export const updatePropertyTax = catchAsync(async (req, res) => {
  const propertyTax = await service.updatePropertyTax(req.params.taxId, req.body);
  res.json({
    success: true,
    message: 'Property tax record updated successfully',
    data: propertyTax,
  });
});

export const deletePropertyTax = catchAsync(async (req, res) => {
  await service.deletePropertyTax(req.params.taxId);
  res.json({ success: true, message: 'Property tax record deleted successfully' });
});
