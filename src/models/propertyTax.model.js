import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyTax = sequelize.define('PropertyTax', {
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
  tax_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assessed_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  annual_tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  tax_paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tax_lien: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'property_taxes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'last_updated',
  underscored: true,
});
