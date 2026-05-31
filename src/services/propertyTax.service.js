import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createPropertyTax = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const propertyTax = await models.PropertyTax.create({
      property_id: propertyId,
      tax_year: data.tax_year,
      assessed_value: data.assessed_value,
      annual_tax: data.annual_tax,
      tax_paid: data.tax_paid,
      payment_date: data.payment_date,
      tax_lien: data.tax_lien,
    });

    return propertyTax;
  } catch (error) {
    console.error('[createPropertyTax] Error:', error.message);
    throw error;
  }
};

export const getPropertyTaxes = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.PropertyTax.findAll({
      where: { property_id: propertyId },
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    console.error('[getPropertyTaxes] Error:', error.message);
    throw error;
  }
};

export const getPropertyTaxById = async (taxId) => {
  try {
    const propertyTax = await models.PropertyTax.findByPk(taxId);
    if (!propertyTax) throw new AppError('Property tax record not found', 404);
    return propertyTax;
  } catch (error) {
    console.error('[getPropertyTaxById] Error:', error.message);
    throw error;
  }
};

export const updatePropertyTax = async (taxId, data) => {
  try {
    const propertyTax = await models.PropertyTax.findByPk(taxId);
    if (!propertyTax) throw new AppError('Property tax record not found', 404);

    await propertyTax.update(data);
    return propertyTax;
  } catch (error) {
    console.error('[updatePropertyTax] Error:', error.message);
    throw error;
  }
};

export const deletePropertyTax = async (taxId) => {
  try {
    const propertyTax = await models.PropertyTax.findByPk(taxId);
    if (!propertyTax) throw new AppError('Property tax record not found', 404);

    await propertyTax.destroy();
  } catch (error) {
    console.error('[deletePropertyTax] Error:', error.message);
    throw error;
  }
};
