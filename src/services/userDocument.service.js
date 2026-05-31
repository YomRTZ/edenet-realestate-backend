import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createUserDocument = async (userId, data) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const doc = await models.UserDocument.create({
      user_id: userId,
      document_type: data.document_type,
      file_url: data.file_url,
      expiry_date: data.expiry_date || null,
    });

    return doc;
  } catch (error) {
    console.error('[createUserDocument] Error:', error.message);
    throw error;
  }
};

export const getUserDocuments = async (userId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    return await models.UserDocument.findAll({
      where: { user_id: userId },
      order: [['uploaded_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getUserDocuments] Error:', error.message);
    throw error;
  }
};

export const getUserDocumentById = async (docId) => {
  try {
    const doc = await models.UserDocument.findByPk(docId);
    if (!doc) throw new AppError('Document not found', 404);
    return doc;
  } catch (error) {
    console.error('[getUserDocumentById] Error:', error.message);
    throw error;
  }
};

export const updateUserDocument = async (docId, data) => {
  try {
    const doc = await models.UserDocument.findByPk(docId);
    if (!doc) throw new AppError('Document not found', 404);

    await doc.update(data);
    return doc;
  } catch (error) {
    console.error('[updateUserDocument] Error:', error.message);
    throw error;
  }
};

export const deleteUserDocument = async (docId) => {
  try {
    const doc = await models.UserDocument.findByPk(docId);
    if (!doc) throw new AppError('Document not found', 404);

    await doc.destroy();
  } catch (error) {
    console.error('[deleteUserDocument] Error:', error.message);
    throw error;
  }
};

export const verifyUserDocument = async (docId, verifierId, status) => {
  try {
    const doc = await models.UserDocument.findByPk(docId);
    if (!doc) throw new AppError('Document not found', 404);

    await doc.update({ verification_status: status, verified_by: verifierId });
    return doc;
  } catch (error) {
    console.error('[verifyUserDocument] Error:', error.message);
    throw error;
  }
};
