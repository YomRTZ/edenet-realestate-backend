import { createUserDocumentFromUpload, createPropertyDocumentFromUpload, getUserDocumentById, getPropertyDocumentById, getDocumentById } from '../services/document.service.js';
import documentCrypto from '../utils/documentCrypto.js';
import { getUploadFsPath } from '../utils/fileHelper.js';
import { AppError } from '../utils/AppError.js';
import path from 'path';
import { ROLES } from '../constants/seeds.js';

export const uploadUserDocument = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const file = req.file;
    const doc = await createUserDocumentFromUpload(userId, file, req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const uploadPropertyDocument = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;
    const file = req.file;
    const doc = await createPropertyDocumentFromUpload(propertyId, userId, file, req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const streamDecryptedDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const doc = await getDocumentById(documentId);
    if (!doc) throw new AppError('Document not found', 404);

    // basic permission: owners or admin
    const user = req.user;
    const userRole = user && (Array.isArray(user.role) ? user.role[0] : user.role);
    const userRoleUpper = userRole ? String(userRole).toUpperCase() : null;
    if (doc.property_id && user && doc.uploaded_by !== user.id && userRoleUpper !== ROLES.ADMIN) {
      throw new AppError('Forbidden', 403);
    }

    const encFsPath = getUploadFsPath(doc.file_url);
    const tmpFilename = `${Date.now()}-${Math.round(Math.random()*1e9)}.dec`;
    const tmpPath = path.join('uploads', 'tmp', tmpFilename);
    await documentCrypto.decryptFile(encFsPath, tmpPath);

    res.sendFile(path.resolve(tmpPath), (err) => {
      // cleanup
      try { if (tmpPath) require('fs').unlinkSync(tmpPath); } catch(e){}
    });
  } catch (error) {
    next(error);
  }
};
