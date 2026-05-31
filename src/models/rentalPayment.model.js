import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const RentalPayment = sequelize.define('RentalPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rental_agreement_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rental_agreements',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  payer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  payment_status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  transaction_reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  receipt_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'rental_payments',
  timestamps: true,
  updatedAt: false,
});
