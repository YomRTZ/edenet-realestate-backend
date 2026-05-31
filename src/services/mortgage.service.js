import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createMortgage = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const mortgage = await models.Mortgage.create({
      property_id: propertyId,
      lender_name: data.lender_name,
      loan_amount: data.loan_amount,
      remaining_balance: data.remaining_balance,
      interest_rate: data.interest_rate,
      loan_start_date: data.loan_start_date,
      loan_end_date: data.loan_end_date,
      is_assumable: data.is_assumable,
    });

    return mortgage;
  } catch (error) {
    console.error('[createMortgage] Error:', error.message);
    throw error;
  }
};

export const getMortgages = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.Mortgage.findAll({
      where: { property_id: propertyId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('[getMortgages] Error:', error.message);
    throw error;
  }
};

export const getMortgageById = async (mortgageId) => {
  try {
    const mortgage = await models.Mortgage.findByPk(mortgageId);
    if (!mortgage) throw new AppError('Mortgage not found', 404);
    return mortgage;
  } catch (error) {
    console.error('[getMortgageById] Error:', error.message);
    throw error;
  }
};

export const updateMortgage = async (mortgageId, data) => {
  try {
    const mortgage = await models.Mortgage.findByPk(mortgageId);
    if (!mortgage) throw new AppError('Mortgage not found', 404);

    await mortgage.update(data);
    return mortgage;
  } catch (error) {
    console.error('[updateMortgage] Error:', error.message);
    throw error;
  }
};

export const deleteMortgage = async (mortgageId) => {
  try {
    const mortgage = await models.Mortgage.findByPk(mortgageId);
    if (!mortgage) throw new AppError('Mortgage not found', 404);

    await mortgage.destroy();
  } catch (error) {
    console.error('[deleteMortgage] Error:', error.message);
    throw error;
  }
};
