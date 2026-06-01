// TEMPLATE: Reference Data Models for Property Management System
// These models should be created in src/models/ and will store the enum values as database records

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Example: PropertyType Model
export const PropertyType = sequelize.define('PropertyType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.ENUM('HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL', 'TOWNHOUSE', 'FARM'),
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'PropertyTypes',
  timestamps: true,
});

// Example: ListingType Model
export const ListingType = sequelize.define('ListingType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.ENUM('SALE', 'RENT', 'BOTH'),
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'ListingTypes',
  timestamps: true,
});

// Example: PropertyStatus Model
export const PropertyStatus = sequelize.define('PropertyStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.ENUM('PENDING_APPROVAL', 'ACTIVE', 'SOLD', 'RENTED', 'INACTIVE', 'UNDER_CONTRACT'),
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'PropertyStatus',
  timestamps: true,
});

// Example: PaymentStatus Model
export const PaymentStatus = sequelize.define('PaymentStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED'),
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'PaymentStatus',
  timestamps: true,
});

// Continue similarly for other models:
// - VerificationStatus
// - TransactionStatus
// - DocumentType
// - NotificationType
// - ShowingStatus
// - MaintenancePriority
// - MaintenanceStatus
// - EscrowStatus
// - AlertFrequency

// Each model should follow the same pattern with an id, name (ENUM), description, and timestamps
