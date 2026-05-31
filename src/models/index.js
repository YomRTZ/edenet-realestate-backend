

import sequelize from '../config/database.js';
import { Role } from './role.model.js';
import { User } from './user.model.js';
import RefreshToken from './refreshToken.model.js';
import { OTP } from './otp.model.js';
import './associations.js';
export { sequelize, Role, User, RefreshToken, OTP };

export const models = sequelize.models;
