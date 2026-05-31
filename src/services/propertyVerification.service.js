import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyVerification = async (propertyId, userId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);
    if (property.deleted_at) throw new AppError('Cannot verify a deleted property', 400);

    const record = await models.PropertyVerification.create({
      property_id: propertyId,
      verified_by: userId,
      verification_status: data.verification_status,
      verification_notes: data.verification_notes,
      verified_at: data.verified_at,
    });

    return record;
  } catch (error) {
    console.error('[createPropertyVerification] Error:', error.message);
    throw error;
  }
};

export const getPropertyVerifications = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyVerification.findAll({
      where: { property_id: propertyId },
      order: [['createdAt', 'ASC']],
    });
  } catch (error) {
    console.error('[getPropertyVerifications] Error:', error.message);
    throw error;
  }
};

export const getPropertyVerificationById = async (verificationId) => {
  try {
    const record = await models.PropertyVerification.findByPk(verificationId);
    if (!record) throw new AppError('Verification record not found', 404);
    return record;
  } catch (error) {
    console.error('[getPropertyVerificationById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyVerification = async (verificationId, userId, data) => {
  try {
    const record = await models.PropertyVerification.findByPk(verificationId);
    if (!record) throw new AppError('Verification record not found', 404);

    const property = await models.Property.findByPk(record.property_id);
    if (!property) throw new AppError('Property not found', 404);

    if (data.verification_status !== undefined) record.verification_status = data.verification_status;
    if (data.verification_notes !== undefined) record.verification_notes = data.verification_notes;
    if (data.verified_at !== undefined) record.verified_at = data.verified_at;
    if (data.verified_by !== undefined) record.verified_by = data.verified_by;

    await record.save();
    return record;
  } catch (error) {
    console.error('[updatePropertyVerification] Error:', error.message);
    throw error;
  }
};

export const deletePropertyVerification = async (verificationId, userId) => {
  try {
    const record = await models.PropertyVerification.findByPk(verificationId);
    if (!record) throw new AppError('Verification record not found', 404);

    const property = await models.Property.findByPk(record.property_id);
    if (!property) throw new AppError('Property not found', 404);

    await record.destroy();
  } catch (error) {
    console.error('[deletePropertyVerification] Error:', error.message);
    throw error;
  }
};
