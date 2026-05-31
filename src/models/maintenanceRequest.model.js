import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rental_agreement_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rental_agreements',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
  issue_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'MEDIUM',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  photos_url: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  assigned_to: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  actual_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  updatedAt: false,
});
