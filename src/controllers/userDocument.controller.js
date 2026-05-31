import * as service from '../services/userDocument.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createUserDocument = catchAsync(async (req, res) => {
  const doc = await service.createUserDocument(req.params.userId, req.body);
  res.status(201).json({ success: true, message: 'Document uploaded', data: doc });
});

export const getUserDocuments = catchAsync(async (req, res) => {
  const docs = await service.getUserDocuments(req.params.userId);
  res.json({ success: true, data: docs });
});

export const getUserDocumentById = catchAsync(async (req, res) => {
  const doc = await service.getUserDocumentById(req.params.documentId);
  res.json({ success: true, data: doc });
});

export const updateUserDocument = catchAsync(async (req, res) => {
  const doc = await service.updateUserDocument(req.params.documentId, req.body);
  res.json({ success: true, message: 'Document updated', data: doc });
});

export const deleteUserDocument = catchAsync(async (req, res) => {
  await service.deleteUserDocument(req.params.documentId);
  res.json({ success: true, message: 'Document deleted' });
});

export const verifyUserDocument = catchAsync(async (req, res) => {
  const doc = await service.verifyUserDocument(req.params.documentId, req.body.verified_by, req.body.verification_status);
  res.json({ success: true, message: 'Document verification updated', data: doc });
});
