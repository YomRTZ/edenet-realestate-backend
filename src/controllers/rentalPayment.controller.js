import * as service from '../services/rentalPayment.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createRentalPayment = catchAsync(async (req, res) => {
  const payment = await service.createRentalPayment(req.params.agreementId, req.body);
  res.status(201).json({
    success: true,
    message: 'Rental payment recorded successfully',
    data: payment,
  });
});

export const getRentalPayments = catchAsync(async (req, res) => {
  const payments = await service.getRentalPayments(req.params.agreementId);
  res.json({ success: true, data: payments });
});

export const getRentalPaymentById = catchAsync(async (req, res) => {
  const payment = await service.getRentalPaymentById(req.params.paymentId);
  res.json({ success: true, data: payment });
});

export const updateRentalPayment = catchAsync(async (req, res) => {
  const payment = await service.updateRentalPayment(req.params.paymentId, req.body);
  res.json({
    success: true,
    message: 'Rental payment updated successfully',
    data: payment,
  });
});

export const deleteRentalPayment = catchAsync(async (req, res) => {
  await service.deleteRentalPayment(req.params.paymentId);
  res.json({ success: true, message: 'Rental payment deleted successfully' });
});
