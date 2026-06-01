import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import { DOCUMENT_VERIFICATION_STATUS } from '../constants/seeds.js';

export const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'RESTRICT',
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
  document_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  document_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  issued_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verification_status: {
    type: DataTypes.ENUM(...Object.values(DOCUMENT_VERIFICATION_STATUS)),
    defaultValue: DOCUMENT_VERIFICATION_STATUS.PENDING,
  },
  verified_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false,
  underscored: true,
});
