import * as service from '../services/rentalAgreement.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createRentalAgreement = catchAsync(async (req, res) => {
  const rentalAgreement = await service.createRentalAgreement(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Rental agreement created successfully',
    data: rentalAgreement,
  });
});

export const getRentalAgreements = catchAsync(async (req, res) => {
  const rentalAgreements = await service.getRentalAgreements(req.params.propertyId);
  res.json({ success: true, data: rentalAgreements });
});

export const getRentalAgreementById = catchAsync(async (req, res) => {
  const rentalAgreement = await service.getRentalAgreementById(req.params.agreementId);
  res.json({ success: true, data: rentalAgreement });
});

export const updateRentalAgreement = catchAsync(async (req, res) => {
  const rentalAgreement = await service.updateRentalAgreement(req.params.agreementId, req.body);
  res.json({
    success: true,
    message: 'Rental agreement updated successfully',
    data: rentalAgreement,
  });
});

export const deleteRentalAgreement = catchAsync(async (req, res) => {
  await service.deleteRentalAgreement(req.params.agreementId);
  res.json({ success: true, message: 'Rental agreement deleted successfully' });
});
