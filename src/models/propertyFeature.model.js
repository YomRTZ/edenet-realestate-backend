import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyFeature = sequelize.define('PropertyFeature', {
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
  feature_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  feature_value: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'property_features',
  timestamps: true,
  updatedAt: false,
});
