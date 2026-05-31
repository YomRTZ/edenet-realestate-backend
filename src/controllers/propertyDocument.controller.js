import * as service from '../services/propertyDocument.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPropertyDocument = catchAsync(async (req, res) => {
  const document = await service.createPropertyDocument(req.params.propertyId, req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Document created successfully', data: document });
});

export const getPropertyDocuments = catchAsync(async (req, res) => {
  const documents = await service.getPropertyDocuments(req.params.propertyId);
  res.json({ success: true, data: documents });
});

export const getPropertyDocumentById = catchAsync(async (req, res) => {
  const document = await service.getPropertyDocumentById(req.params.documentId);
  res.json({ success: true, data: document });
});

export const updatePropertyDocument = catchAsync(async (req, res) => {
  const document = await service.updatePropertyDocument(req.params.documentId, req.user.id, req.body);
  res.json({ success: true, message: 'Document updated successfully', data: document });
});

export const deletePropertyDocument = catchAsync(async (req, res) => {
  await service.deletePropertyDocument(req.params.documentId, req.user.id);
  res.json({ success: true, message: 'Document deleted successfully' });
});
