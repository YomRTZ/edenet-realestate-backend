import express from 'express';
import * as controller from '../controllers/saleTransaction.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createSaleTransactionSchema, updateSaleTransactionSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/sale-transactions', verifyToken, validate(createSaleTransactionSchema), controller.createSaleTransaction);
router.get('/:propertyId/sale-transactions', controller.getSaleTransactions);
router.get('/sale-transactions/:transactionId', controller.getSaleTransactionById);
router.put('/sale-transactions/:transactionId', verifyToken, validate(updateSaleTransactionSchema), controller.updateSaleTransaction);
router.delete('/sale-transactions/:transactionId', verifyToken, controller.deleteSaleTransaction);

export default router;
