import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PropertyDocument = sequelize.define('PropertyDocument', {
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
  document_type: {
    type: DataTypes.ENUM('DEED', 'TITLE', 'SURVEY', 'INSPECTION', 'TAX_RECORD', 'INSURANCE', 'CONTRACT', 'LEASE'),
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
}, {
  tableName: 'property_documents',
  timestamps: true,
  updatedAt: false,
});
