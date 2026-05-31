import express from 'express';
import * as controller from '../controllers/maintenanceRequest.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createMaintenanceRequestSchema, updateMaintenanceRequestSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/rental-agreements/:agreementId/maintenance-requests', verifyToken, validate(createMaintenanceRequestSchema), controller.createMaintenanceRequest);
router.get('/:propertyId/rental-agreements/:agreementId/maintenance-requests', controller.getMaintenanceRequests);
router.get('/maintenance-requests/:requestId', controller.getMaintenanceRequestById);
router.put('/maintenance-requests/:requestId', verifyToken, validate(updateMaintenanceRequestSchema), controller.updateMaintenanceRequest);
router.delete('/maintenance-requests/:requestId', verifyToken, controller.deleteMaintenanceRequest);

export default router;
