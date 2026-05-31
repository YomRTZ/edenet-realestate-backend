import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const SaleTransaction = sequelize.define('SaleTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  buyer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  agent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  sale_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  earnest_money_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  closing_costs_seller: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  closing_costs_buyer: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  contract_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  closing_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  inspection_contingency_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  financing_contingency_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deed_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  escrow_company: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  title_company: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  transaction_status: {
    type: DataTypes.ENUM('PENDING', 'UNDER_CONTRACT', 'CLOSED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'sale_transactions',
  timestamps: true,
  updatedAt: false,
});
