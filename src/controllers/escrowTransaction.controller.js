import * as service from '../services/escrowTransaction.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createEscrowTransaction = catchAsync(async (req, res) => {
  const escrowTransaction = await service.createEscrowTransaction(
    req.params.propertyId,
    req.params.transactionId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Escrow transaction created successfully',
    data: escrowTransaction,
  });
});

export const getEscrowTransactions = catchAsync(async (req, res) => {
  const escrowTransactions = await service.getEscrowTransactions(
    req.params.propertyId,
    req.params.transactionId
  );

  res.json({ success: true, data: escrowTransactions });
});

export const getEscrowTransactionById = catchAsync(async (req, res) => {
  const escrowTransaction = await service.getEscrowTransactionById(req.params.escrowId);
  res.json({ success: true, data: escrowTransaction });
});

export const updateEscrowTransaction = catchAsync(async (req, res) => {
  const escrowTransaction = await service.updateEscrowTransaction(req.params.escrowId, req.body);
  res.json({
    success: true,
    message: 'Escrow transaction updated successfully',
    data: escrowTransaction,
  });
});

export const deleteEscrowTransaction = catchAsync(async (req, res) => {
  await service.deleteEscrowTransaction(req.params.escrowId);
  res.json({ success: true, message: 'Escrow transaction deleted successfully' });
});
