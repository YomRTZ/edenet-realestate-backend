import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import { OTP_PURPOSES } from '../constants/seeds.js';

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
    type: DataTypes.ENUM(...Object.values(OTP_PURPOSES)),
    allowNull: false,
    defaultValue: OTP_PURPOSES.EMAIL_VERIFICATION,
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
