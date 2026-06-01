

import  sequelize  from '../config/database.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('User', {
   id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
  },
  profile_image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  national_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  preferred_language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, { 
  tableName: 'users', 
  timestamps: true,
});
