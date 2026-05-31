import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const Mortgage = sequelize.define('Mortgage', {
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
  lender_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  loan_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  remaining_balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  loan_start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  loan_end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_assumable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'mortgages',
  timestamps: true,
  updatedAt: false,
});
