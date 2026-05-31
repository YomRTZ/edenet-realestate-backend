import express from 'express';
import * as controller from '../controllers/availability.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAvailabilitySchema, updateAvailabilitySchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/availability', verifyToken, validate(createAvailabilitySchema), controller.createAvailability);
router.get('/:propertyId/availability', controller.getAvailabilities);
router.get('/availability/:availabilityId', controller.getAvailabilityById);
router.put('/availability/:availabilityId', verifyToken, validate(updateAvailabilitySchema), controller.updateAvailability);
router.delete('/availability/:availabilityId', verifyToken, controller.deleteAvailability);

export default router;
