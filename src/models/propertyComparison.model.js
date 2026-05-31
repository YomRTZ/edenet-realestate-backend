import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyComparison = sequelize.define('PropertyComparison', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  property_ids: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false,
  },
}, {
  tableName: 'property_comparisons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true,
});
