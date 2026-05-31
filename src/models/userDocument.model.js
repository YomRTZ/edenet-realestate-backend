import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const UserDocument = sequelize.define('UserDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  document_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  verification_status: {
    type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
  verified_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'user_documents',
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false,
  underscored: true,
});
