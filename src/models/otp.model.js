import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM('email_verification', 'password_reset', 'two_factor'),
    allowNull: false,
    defaultValue: 'email_verification',
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'otps',
  timestamps: true,
});
