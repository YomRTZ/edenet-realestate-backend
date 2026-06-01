import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import { TRANSACTION_TYPES } from '../constants/seeds.js';

export const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reviewer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  reviewee_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'properties',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  transaction_type: {
    type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPES)),
    allowNull: true,
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_verified_purchase: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});
