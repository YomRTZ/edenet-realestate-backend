import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyInquiry = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const inquiry = await models.PropertyInquiry.create({
      property_id: propertyId,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      message: data.message,
      is_replied: data.is_replied,
      replied_at: data.replied_at,
    });

    return inquiry;
  } catch (error) {
    console.error('[createPropertyInquiry] Error:', error.message);
    throw error;
  }
};

export const getPropertyInquiries = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyInquiry.findAll({
      where: { property_id: propertyId },
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getPropertyInquiries] Error:', error.message);
    throw error;
  }
};

export const getPropertyInquiryById = async (inquiryId) => {
  try {
    const inquiry = await models.PropertyInquiry.findByPk(inquiryId);
    if (!inquiry) throw new AppError('Property inquiry not found', 404);
    return inquiry;
  } catch (error) {
    console.error('[getPropertyInquiryById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyInquiry = async (inquiryId, data) => {
  try {
    const inquiry = await models.PropertyInquiry.findByPk(inquiryId);
    if (!inquiry) throw new AppError('Property inquiry not found', 404);

    await inquiry.update(data);
    return inquiry;
  } catch (error) {
    console.error('[updatePropertyInquiry] Error:', error.message);
    throw error;
  }
};

export const deletePropertyInquiry = async (inquiryId) => {
  try {
    const inquiry = await models.PropertyInquiry.findByPk(inquiryId);
    if (!inquiry) throw new AppError('Property inquiry not found', 404);

    await inquiry.destroy();
  } catch (error) {
    console.error('[deletePropertyInquiry] Error:', error.message);
    throw error;
  }
};
