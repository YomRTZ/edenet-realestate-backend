

import  sequelize  from '../config/database.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('User', {
   id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
}, { tableName: 'users', timestamps: true });
