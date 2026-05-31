import express from 'express';
import * as controller from '../controllers/propertyOwnership.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyOwnershipSchema, updatePropertyOwnershipSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/', verifyToken, validate(createPropertyOwnershipSchema), controller.createPropertyOwnership);
router.get('/', controller.getPropertyOwnerships);
router.get('/:ownershipId', controller.getPropertyOwnershipById);
router.put('/:ownershipId', verifyToken, validate(updatePropertyOwnershipSchema), controller.updatePropertyOwnership);
router.delete('/:ownershipId', verifyToken, controller.deletePropertyOwnership);

export default router;
