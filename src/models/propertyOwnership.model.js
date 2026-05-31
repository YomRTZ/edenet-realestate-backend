import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyOwnership = sequelize.define('PropertyOwnership', {
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
  ownership_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
  },
  deed_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_current: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'property_ownerships',
  timestamps: true,
  updatedAt: false,
});
