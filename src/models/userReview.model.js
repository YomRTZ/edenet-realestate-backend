import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const UserReview = sequelize.define('UserReview', {
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
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  transaction_type: {
    type: DataTypes.ENUM('SALE', 'RENTAL'),
    allowNull: false,
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
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
}, {
  tableName: 'user_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true,
});
