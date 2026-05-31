import express from 'express';
import * as controller from '../controllers/rentalAgreement.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createRentalAgreementSchema, updateRentalAgreementSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/rental-agreements', verifyToken, validate(createRentalAgreementSchema), controller.createRentalAgreement);
router.get('/:propertyId/rental-agreements', controller.getRentalAgreements);
router.get('/:propertyId/rental-agreements/:agreementId', controller.getRentalAgreementById);
router.put('/:propertyId/rental-agreements/:agreementId', verifyToken, validate(updateRentalAgreementSchema), controller.updateRentalAgreement);
router.delete('/:propertyId/rental-agreements/:agreementId', verifyToken, controller.deleteRentalAgreement);

export default router;
