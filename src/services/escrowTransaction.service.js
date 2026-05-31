import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createEscrowTransaction = async (propertyId, transactionId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const saleTransaction = await models.SaleTransaction.findOne({
      where: { id: transactionId, property_id: propertyId },
    });
    if (!saleTransaction) throw new AppError('Sale transaction not found for this property', 404);

    const escrowTransaction = await models.EscrowTransaction.create({
      sale_transaction_id: transactionId,
      amount: data.amount,
      escrow_status: data.escrow_status,
      deposited_by: data.deposited_by,
      released_at: data.released_at,
      released_to: data.released_to,
      dispute_reason: data.dispute_reason,
    });

    return escrowTransaction;
  } catch (error) {
    console.error('[createEscrowTransaction] Error:', error.message);
    throw error;
  }
};

export const getEscrowTransactions = async (propertyId, transactionId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const saleTransaction = await models.SaleTransaction.findOne({
      where: { id: transactionId, property_id: propertyId },
    });
    if (!saleTransaction) throw new AppError('Sale transaction not found for this property', 404);

    return await models.EscrowTransaction.findAll({
      where: { sale_transaction_id: transactionId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('[getEscrowTransactions] Error:', error.message);
    throw error;
  }
};

export const getEscrowTransactionById = async (escrowId) => {
  try {
    const escrowTransaction = await models.EscrowTransaction.findByPk(escrowId);
    if (!escrowTransaction) throw new AppError('Escrow transaction not found', 404);
    return escrowTransaction;
  } catch (error) {
    console.error('[getEscrowTransactionById] Error:', error.message);
    throw error;
  }
};

export const updateEscrowTransaction = async (escrowId, data) => {
  try {
    const escrowTransaction = await models.EscrowTransaction.findByPk(escrowId);
    if (!escrowTransaction) throw new AppError('Escrow transaction not found', 404);

    await escrowTransaction.update(data);
    return escrowTransaction;
  } catch (error) {
    console.error('[updateEscrowTransaction] Error:', error.message);
    throw error;
  }
};

export const deleteEscrowTransaction = async (escrowId) => {
  try {
    const escrowTransaction = await models.EscrowTransaction.findByPk(escrowId);
    if (!escrowTransaction) throw new AppError('Escrow transaction not found', 404);

    await escrowTransaction.destroy();
  } catch (error) {
    console.error('[deleteEscrowTransaction] Error:', error.message);
    throw error;
  }
};
