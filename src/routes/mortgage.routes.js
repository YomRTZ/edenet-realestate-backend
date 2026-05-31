import express from 'express';
import * as controller from '../controllers/mortgage.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createMortgageSchema, updateMortgageSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/mortgages', verifyToken, validate(createMortgageSchema), controller.createMortgage);
router.get('/:propertyId/mortgages', controller.getMortgages);
router.get('/mortgages/:mortgageId', controller.getMortgageById);
router.put('/mortgages/:mortgageId', verifyToken, validate(updateMortgageSchema), controller.updateMortgage);
router.delete('/mortgages/:mortgageId', verifyToken, controller.deleteMortgage);

export default router;
