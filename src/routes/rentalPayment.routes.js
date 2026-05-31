import express from 'express';
import * as controller from '../controllers/rentalPayment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createRentalPaymentSchema, updateRentalPaymentSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/rental-agreements/:agreementId/payments', verifyToken, validate(createRentalPaymentSchema), controller.createRentalPayment);
router.get('/:propertyId/rental-agreements/:agreementId/payments', controller.getRentalPayments);
router.get('/payments/:paymentId', controller.getRentalPaymentById);
router.put('/payments/:paymentId', verifyToken, validate(updateRentalPaymentSchema), controller.updateRentalPayment);
router.delete('/payments/:paymentId', verifyToken, controller.deleteRentalPayment);

export default router;
