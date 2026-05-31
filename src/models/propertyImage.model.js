import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyImage = sequelize.define('PropertyImage', {
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
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  caption: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'property_images',
  timestamps: true,
  updatedAt: false,
});
