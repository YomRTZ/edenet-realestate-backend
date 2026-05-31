import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createRentalPayment = async (agreementId, data) => {
  try {
    const agreement = await models.RentalAgreement.findByPk(agreementId);
    if (!agreement) throw new AppError('Rental agreement not found', 404);

    const payment = await models.RentalPayment.create({
      rental_agreement_id: agreementId,
      payer_id: data.payer_id,
      amount: data.amount,
      payment_date: data.payment_date,
      due_date: data.due_date,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      transaction_reference: data.transaction_reference,
      receipt_url: data.receipt_url,
    });

    return payment;
  } catch (error) {
    console.error('[createRentalPayment] Error:', error.message);
    throw error;
  }
};

export const getRentalPayments = async (agreementId) => {
  try {
    const agreement = await models.RentalAgreement.findByPk(agreementId);
    if (!agreement) throw new AppError('Rental agreement not found', 404);

    return await models.RentalPayment.findAll({
      where: { rental_agreement_id: agreementId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('[getRentalPayments] Error:', error.message);
    throw error;
  }
};

export const getRentalPaymentById = async (paymentId) => {
  try {
    const payment = await models.RentalPayment.findByPk(paymentId);
    if (!payment) throw new AppError('Rental payment not found', 404);
    return payment;
  } catch (error) {
    console.error('[getRentalPaymentById] Error:', error.message);
    throw error;
  }
};

export const updateRentalPayment = async (paymentId, data) => {
  try {
    const payment = await models.RentalPayment.findByPk(paymentId);
    if (!payment) throw new AppError('Rental payment not found', 404);

    await payment.update(data);
    return payment;
  } catch (error) {
    console.error('[updateRentalPayment] Error:', error.message);
    throw error;
  }
};

export const deleteRentalPayment = async (paymentId) => {
  try {
    const payment = await models.RentalPayment.findByPk(paymentId);
    if (!payment) throw new AppError('Rental payment not found', 404);

    await payment.destroy();
  } catch (error) {
    console.error('[deleteRentalPayment] Error:', error.message);
    throw error;
  }
};
