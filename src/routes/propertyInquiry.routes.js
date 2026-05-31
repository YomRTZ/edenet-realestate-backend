import express from 'express';
import * as controller from '../controllers/propertyInquiry.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyInquirySchema, updatePropertyInquirySchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/property-inquiries', verifyToken, validate(createPropertyInquirySchema), controller.createPropertyInquiry);
router.get('/:propertyId/property-inquiries', controller.getPropertyInquiries);
router.get('/property-inquiries/:inquiryId', controller.getPropertyInquiryById);
router.put('/property-inquiries/:inquiryId', verifyToken, validate(updatePropertyInquirySchema), controller.updatePropertyInquiry);
router.delete('/property-inquiries/:inquiryId', verifyToken, controller.deletePropertyInquiry);

export default router;
