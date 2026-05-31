import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyInquiry = sequelize.define('PropertyInquiry', {
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
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_replied: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  replied_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'property_inquiries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true,
});
