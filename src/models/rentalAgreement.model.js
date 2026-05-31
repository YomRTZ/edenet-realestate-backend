import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const RentalAgreement = sequelize.define('RentalAgreement', {
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
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  tenant_id: {
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
  monthly_rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  security_deposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  late_fee_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  late_fee_fixed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  grace_period_days: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  renewal_option: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  termination_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  utilities_included: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  signed_by_owner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  signed_by_tenant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  agreement_file_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'rental_agreements',
  timestamps: true,
  updatedAt: false,
});
