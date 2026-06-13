// src/validation/rentalSchemas.js
const { z } = require('zod');

const txHashField   = z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'txHash must be a valid 32-byte hex hash');
const walletField   = z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum wallet address');
const weiAmountField = (label) =>
  z.string().regex(/^\d+$/, `${label} must be a positive integer string (wei amount)`);

const listForRentSchema = z.object({
  wallet:         walletField,
  monthlyRent:    z.coerce.number().positive('Monthly rent must be greater than 0'),
  durationMonths: z.coerce.number().int().min(1).max(60, 'Duration must be between 1 and 60 months'),
});

const unlistFromRentSchema = z.object({
  wallet: walletField,
});

const createRentalSchema = z.object({
  wallet:         walletField,
  txHash:         txHashField,
  monthlyRent:    weiAmountField('Monthly rent'),
  faithDeposit:   weiAmountField('Faith deposit'),
  startTime:      z.coerce.number().int().positive('Start time must be a Unix timestamp'),
  endTime:        z.coerce.number().int().positive('End time must be a Unix timestamp'),
  durationMonths: z.coerce.number().int().min(1).max(60),
});

const payRentSchema = z.object({
  wallet:        walletField,
  txHash:        txHashField,
  amount:        weiAmountField('Amount'),
  nextPaymentDue: z.coerce.number().int().positive('nextPaymentDue must be a Unix timestamp'),
  wasLate:       z.coerce.boolean().optional().default(false),
  penaltyAmount: weiAmountField('Penalty amount').optional(),
});

const terminateRentalSchema = z.object({
  wallet:       walletField,
  txHash:       txHashField,
  reason:       z.string().trim().min(1, 'Termination reason is required'),
  terminatedBy: z.enum(['tenant', 'landlord']),
});

const finalizeRentalSchema = z.object({
  txHash: txHashField,
});

module.exports = {
  listForRentSchema,
  unlistFromRentSchema,
  createRentalSchema,
  payRentSchema,
  terminateRentalSchema,
  finalizeRentalSchema,
};
