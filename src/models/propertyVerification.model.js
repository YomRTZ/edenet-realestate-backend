import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyVerification = sequelize.define('PropertyVerification', {
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
  verified_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  verification_status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'),
    allowNull: false,
  },
  verification_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'property_verifications',
  timestamps: true,
  updatedAt: false,
});
