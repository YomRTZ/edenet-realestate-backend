import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyDocument = async (propertyId, userId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only add documents to your own properties', 403);
    if (property.deleted_at) throw new AppError('Cannot add documents to a deleted property', 400);

    const document = await models.PropertyDocument.create({
      property_id: propertyId,
      document_type: data.document_type,
      file_url: data.file_url,
      document_number: data.document_number,
      issued_date: data.issued_date,
      expiry_date: data.expiry_date,
    });

    return document;
  } catch (error) {
    console.error('[createPropertyDocument] Error:', error.message);
    throw error;
  }
};

export const getPropertyDocuments = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyDocument.findAll({
      where: { property_id: propertyId },
      order: [['createdAt', 'ASC']],
    });
  } catch (error) {
    console.error('[getPropertyDocuments] Error:', error.message);
    throw error;
  }
};

export const getPropertyDocumentById = async (documentId) => {
  try {
    const document = await models.PropertyDocument.findByPk(documentId);
    if (!document) throw new AppError('Document not found', 404);
    return document;
  } catch (error) {
    console.error('[getPropertyDocumentById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyDocument = async (documentId, userId, data) => {
  try {
    const document = await models.PropertyDocument.findByPk(documentId);
    if (!document) throw new AppError('Document not found', 404);

    const property = await models.Property.findByPk(document.property_id);
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
    const document = await models.PropertyDocument.findByPk(documentId);
    if (!document) throw new AppError('Document not found', 404);

    const property = await models.Property.findByPk(document.property_id);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only delete documents from your own properties', 403);

    await document.destroy();
  } catch (error) {
    console.error('[deletePropertyDocument] Error:', error.message);
    throw error;
  }
};
