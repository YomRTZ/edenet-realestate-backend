import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const createSaleTransaction = async (propertyId, data) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const saleTransaction = await models.SaleTransaction.create({
      property_id: propertyId,
      seller_id: data.seller_id,
      buyer_id: data.buyer_id,
      agent_id: data.agent_id,
      sale_price: data.sale_price,
      earnest_money_amount: data.earnest_money_amount,
      closing_costs_seller: data.closing_costs_seller,
      closing_costs_buyer: data.closing_costs_buyer,
      contract_date: data.contract_date,
      closing_date: data.closing_date,
      inspection_contingency_date: data.inspection_contingency_date,
      financing_contingency_date: data.financing_contingency_date,
      deed_number: data.deed_number,
      escrow_company: data.escrow_company,
      title_company: data.title_company,
      commission_amount: data.commission_amount,
      transaction_status: data.transaction_status,
    });

    return saleTransaction;
  } catch (error) {
    console.error('[createSaleTransaction] Error:', error.message);
    throw error;
  }
};

export const getSaleTransactions = async (propertyId) => {
  try {
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    return await models.SaleTransaction.findAll({
      where: { property_id: propertyId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('[getSaleTransactions] Error:', error.message);
    throw error;
  }
};

export const getSaleTransactionById = async (transactionId) => {
  try {
    const saleTransaction = await models.SaleTransaction.findByPk(transactionId);
    if (!saleTransaction) throw new AppError('Sale transaction not found', 404);
    return saleTransaction;
  } catch (error) {
    console.error('[getSaleTransactionById] Error:', error.message);
    throw error;
  }
};

export const updateSaleTransaction = async (transactionId, data) => {
  try {
    const saleTransaction = await models.SaleTransaction.findByPk(transactionId);
    if (!saleTransaction) throw new AppError('Sale transaction not found', 404);

    await saleTransaction.update(data);
    return saleTransaction;
  } catch (error) {
    console.error('[updateSaleTransaction] Error:', error.message);
    throw error;
  }
};

export const deleteSaleTransaction = async (transactionId) => {
  try {
    const saleTransaction = await models.SaleTransaction.findByPk(transactionId);
    if (!saleTransaction) throw new AppError('Sale transaction not found', 404);

    await saleTransaction.destroy();
  } catch (error) {
    console.error('[deleteSaleTransaction] Error:', error.message);
    throw error;
  }
};
