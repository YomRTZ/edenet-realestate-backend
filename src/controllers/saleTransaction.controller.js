import * as service from '../services/saleTransaction.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createSaleTransaction = catchAsync(async (req, res) => {
  const saleTransaction = await service.createSaleTransaction(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Sale transaction created successfully',
    data: saleTransaction,
  });
});

export const getSaleTransactions = catchAsync(async (req, res) => {
  const saleTransactions = await service.getSaleTransactions(req.params.propertyId);
  res.json({ success: true, data: saleTransactions });
});

export const getSaleTransactionById = catchAsync(async (req, res) => {
  const saleTransaction = await service.getSaleTransactionById(req.params.transactionId);
  res.json({ success: true, data: saleTransaction });
});

export const updateSaleTransaction = catchAsync(async (req, res) => {
  const saleTransaction = await service.updateSaleTransaction(req.params.transactionId, req.body);
  res.json({
    success: true,
    message: 'Sale transaction updated successfully',
    data: saleTransaction,
  });
});

export const deleteSaleTransaction = catchAsync(async (req, res) => {
  await service.deleteSaleTransaction(req.params.transactionId);
  res.json({ success: true, message: 'Sale transaction deleted successfully' });
});
