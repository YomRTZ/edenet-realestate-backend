import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyView = sequelize.define('PropertyView', {
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
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  ip_address: {
    type: DataTypes.INET || DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'property_views',
  timestamps: true,
  createdAt: 'viewed_at',
  updatedAt: false,
  underscored: true,
});
