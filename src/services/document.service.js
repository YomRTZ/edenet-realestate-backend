import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import path from 'path';
import fs from 'fs';
import documentCrypto from '../utils/documentCrypto.js';
import { getUploadDbPath, getUploadFsPath, removeFileByFsPath, UPLOADS_DIR } from '../utils/fileHelper.js';

export const getDocumentById = async (documentId) => {
  const document = await models.Document.findByPk(documentId);
  if (!document) throw new AppError('Document not found', 404);
  return document;
};

export const createUserDocument = async (userId, data) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const doc = await models.Document.create({
      uploaded_by: userId,
      document_type: data.document_type,
      file_url: data.file_url,
      document_number: data.document_number || null,
      issued_date: data.issued_date || null,
      expiry_date: data.expiry_date || null,
    });

    return doc;
  } catch (error) {
    console.error('[createUserDocument] Error:', error.message);
    throw error;
  }
};

export const createUserDocumentFromUpload = async (userId, file, data = {}) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!file) throw new AppError('No file provided', 400);

    const encDir = path.join(UPLOADS_DIR, 'documents_encrypted');
    const encFilename = `${file.filename}.enc`;
    const encFsPath = path.join(encDir, encFilename);

    await documentCrypto.encryptFile(file.path, encFsPath);
    // remove original uploaded file
    try { await fs.promises.unlink(file.path); } catch (e) { /* ignore */ }

    const dbPath = getUploadDbPath(path.posix.join('documents_encrypted', encFilename));

    const doc = await models.Document.create({
      uploaded_by: userId,
      document_type: data.document_type || null,
      file_url: dbPath,
      document_number: data.document_number || null,
      issued_date: data.issued_date || null,
      expiry_date: data.expiry_date || null,
    });

    return doc;
  } catch (error) {
    console.error('[createUserDocumentFromUpload] Error:', error.message);
    throw error;
  }
};

export const getUserDocuments = async (userId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    return await models.Document.findAll({
      where: { uploaded_by: userId },
      order: [['uploaded_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getUserDocuments] Error:', error.message);
    throw error;
  }
};

export const getUserDocumentById = async (documentId) => {
  try {
    return await getDocumentById(documentId);
  } catch (error) {
    console.error('[getUserDocumentById] Error:', error.message);
    throw error;
  }
};

export const updateUserDocument = async (documentId, data) => {
  try {
    const doc = await getDocumentById(documentId);

    await doc.update(data);
    return doc;
  } catch (error) {
    console.error('[updateUserDocument] Error:', error.message);
    throw error;
  }
};

export const deleteUserDocument = async (documentId) => {
  try {
    const doc = await getDocumentById(documentId);
    // remove associated file from disk if present
    try {
      const fsPath = getUploadFsPath(doc.file_url);
      await removeFileByFsPath(fsPath);
    } catch (e) { /* ignore */ }
    await doc.destroy();
  } catch (error) {
    console.error('[deleteUserDocument] Error:', error.message);
    throw error;
  }
};

export const verifyUserDocument = async (documentId, verifierId, status) => {
  try {
    const doc = await getDocumentById(documentId);
    await doc.update({ verification_status: status, verified_by: verifierId });
    return doc;
  } catch (error) {
    console.error('[verifyUserDocument] Error:', error.message);
    throw error;
  }
};

export const createPropertyDocument = async (propertyId, userId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only add documents to your own properties', 403);
    if (property.deleted_at) throw new AppError('Cannot add documents to a deleted property', 400);

    const document = await models.Document.create({
      property_id: propertyId,
      uploaded_by: userId,
      document_type: data.document_type,
      file_url: data.file_url,
      document_number: data.document_number || null,
      issued_date: data.issued_date || null,
      expiry_date: data.expiry_date || null,
    });

    return document;
  } catch (error) {
    console.error('[createPropertyDocument] Error:', error.message);
    throw error;
  }
};

export const createPropertyDocumentFromUpload = async (propertyId, userId, file, data = {}) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only add documents to your own properties', 403);
    if (property.deleted_at) throw new AppError('Cannot add documents to a deleted property', 400);
    if (!file) throw new AppError('No file provided', 400);

    const encDir = path.join(UPLOADS_DIR, 'documents_encrypted');
    const encFilename = `${file.filename}.enc`;
    const encFsPath = path.join(encDir, encFilename);

    await documentCrypto.encryptFile(file.path, encFsPath);
    try { await fs.promises.unlink(file.path); } catch (e) { /* ignore */ }

    const dbPath = getUploadDbPath(path.posix.join('documents_encrypted', encFilename));

    const document = await models.Document.create({
      property_id: propertyId,
      uploaded_by: userId,
      document_type: data.document_type || null,
      file_url: dbPath,
      document_number: data.document_number || null,
      issued_date: data.issued_date || null,
      expiry_date: data.expiry_date || null,
    });

    return document;
  } catch (error) {
    console.error('[createPropertyDocumentFromUpload] Error:', error.message);
    throw error;
  }
};

export const getPropertyDocuments = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.Document.findAll({
      where: { property_id: propertyId },
      order: [['uploaded_at', 'ASC']],
    });
  } catch (error) {
    console.error('[getPropertyDocuments] Error:', error.message);
    throw error;
  }
};

export const getPropertyDocumentById = async (documentId) => {
  try {
    return await getDocumentById(documentId);
  } catch (error) {
    console.error('[getPropertyDocumentById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyDocument = async (documentId, userId, data) => {
  try {
    const document = await getDocumentById(documentId);
    if (!document.property_id) throw new AppError('Document is not a property document', 400);

    const property = await models.Property.findByPk(document.property_id);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only update documents for your own properties', 403);

    if (data.document_type !== undefined) document.document_type = data.document_type;
    if (data.file_url !== undefined) document.file_url = data.file_url;
    if (data.document_number !== undefined) document.document_number = data.document_number;
    if (data.issued_date !== undefined) document.issued_date = data.issued_date;
    if (data.expiry_date !== undefined) document.expiry_date = data.expiry_date;

    await document.save();
    return document;
  } catch (error) {
    console.error('[updatePropertyDocument] Error:', error.message);
    throw error;
  }
};

export const deletePropertyDocument = async (documentId, userId) => {
  try {
    const document = await getDocumentById(documentId);
    if (!document.property_id) throw new AppError('Document is not a property document', 400);

    const property = await models.Property.findByPk(document.property_id);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only delete documents from your own properties', 403);

    try {
      const fsPath = getUploadFsPath(document.file_url);
      await removeFileByFsPath(fsPath);
    } catch (e) { /* ignore */ }
    await document.destroy();
  } catch (error) {
    console.error('[deletePropertyDocument] Error:', error.message);
    throw error;
  }
};
