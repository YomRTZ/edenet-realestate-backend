import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createRentalAgreement = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const rentalAgreement = await models.RentalAgreement.create({
      property_id: propertyId,
      owner_id: data.owner_id,
      tenant_id: data.tenant_id,
      agent_id: data.agent_id,
      monthly_rent: data.monthly_rent,
      security_deposit: data.security_deposit,
      late_fee_percentage: data.late_fee_percentage,
      late_fee_fixed: data.late_fee_fixed,
      grace_period_days: data.grace_period_days,
      start_date: data.start_date,
      end_date: data.end_date,
      renewal_option: data.renewal_option,
      termination_fee: data.termination_fee,
      utilities_included: data.utilities_included,
      is_active: data.is_active,
      signed_by_owner: data.signed_by_owner,
      signed_by_tenant: data.signed_by_tenant,
      agreement_file_url: data.agreement_file_url,
    });

    return rentalAgreement;
  } catch (error) {
    console.error('[createRentalAgreement] Error:', error.message);
    throw error;
  }
};

export const getRentalAgreements = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.RentalAgreement.findAll({
      where: { property_id: propertyId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('[getRentalAgreements] Error:', error.message);
    throw error;
  }
};

export const getRentalAgreementById = async (agreementId) => {
  try {
    const rentalAgreement = await models.RentalAgreement.findByPk(agreementId);
    if (!rentalAgreement) throw new AppError('Rental agreement not found', 404);
    return rentalAgreement;
  } catch (error) {
    console.error('[getRentalAgreementById] Error:', error.message);
    throw error;
  }
};

export const updateRentalAgreement = async (agreementId, data) => {
  try {
    const rentalAgreement = await models.RentalAgreement.findByPk(agreementId);
    if (!rentalAgreement) throw new AppError('Rental agreement not found', 404);

    await rentalAgreement.update(data);
    return rentalAgreement;
  } catch (error) {
    console.error('[updateRentalAgreement] Error:', error.message);
    throw error;
  }
};

export const deleteRentalAgreement = async (agreementId) => {
  try {
    const rentalAgreement = await models.RentalAgreement.findByPk(agreementId);
    if (!rentalAgreement) throw new AppError('Rental agreement not found', 404);

    await rentalAgreement.destroy();
  } catch (error) {
    console.error('[deleteRentalAgreement] Error:', error.message);
    throw error;
  }
};
