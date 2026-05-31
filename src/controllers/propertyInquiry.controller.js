import * as service from '../services/propertyInquiry.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyInquiry = catchAsync(async (req, res) => {
  const inquiry = await service.createPropertyInquiry(req.params.propertyId, req.body);
  res.status(201).json({
    success: true,
    message: 'Property inquiry created successfully',
    data: inquiry,
  });
});

export const getPropertyInquiries = catchAsync(async (req, res) => {
  const inquiries = await service.getPropertyInquiries(req.params.propertyId);
  res.json({ success: true, data: inquiries });
});

export const getPropertyInquiryById = catchAsync(async (req, res) => {
  const inquiry = await service.getPropertyInquiryById(req.params.inquiryId);
  res.json({ success: true, data: inquiry });
});

export const updatePropertyInquiry = catchAsync(async (req, res) => {
  const inquiry = await service.updatePropertyInquiry(req.params.inquiryId, req.body);
  res.json({
    success: true,
    message: 'Property inquiry updated successfully',
    data: inquiry,
  });
});

export const deletePropertyInquiry = catchAsync(async (req, res) => {
  await service.deletePropertyInquiry(req.params.inquiryId);
  res.json({ success: true, message: 'Property inquiry deleted successfully' });
});
