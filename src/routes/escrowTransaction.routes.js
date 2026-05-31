import express from 'express';
import * as controller from '../controllers/escrowTransaction.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createEscrowTransactionSchema, updateEscrowTransactionSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post(
  '/:propertyId/sale-transactions/:transactionId/escrow-transactions',
  verifyToken,
  validate(createEscrowTransactionSchema),
  controller.createEscrowTransaction
);
router.get('/:propertyId/sale-transactions/:transactionId/escrow-transactions', controller.getEscrowTransactions);
router.get('/sale-transactions/:transactionId/escrow-transactions/:escrowId', controller.getEscrowTransactionById);
router.put(
  '/sale-transactions/:transactionId/escrow-transactions/:escrowId',
  verifyToken,
  validate(updateEscrowTransactionSchema),
  controller.updateEscrowTransaction
);
router.delete('/sale-transactions/:transactionId/escrow-transactions/:escrowId', verifyToken, controller.deleteEscrowTransaction);

export default router;
