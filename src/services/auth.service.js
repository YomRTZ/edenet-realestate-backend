import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { hashPassword, comparePassword } from '../utils/password.js';
import { AppError } from '../utils/AppError.js';
import { models } from '../models/index.js';
import { generateOTP, getOTPExpiration } from '../utils/otp.js';
import { isOTPVerified } from './otp.service.js';
import { OTP_PURPOSES, ROLES } from '../constants/seeds.js';

export const registerUser = async ({ email, password, password_hash, first_name, last_name, phone, role }) => {
  try {
    const rawPassword = password || password_hash;
    if (!rawPassword) throw new AppError('Password is required for registration', 400);

    const existingEmail = await models.User.findOne({ where: { email } });
    if (existingEmail) {
      throw new AppError('Email already exists. Please use another email or log in instead.', 409);
    }

    if (phone) {
      const existingPhone = await models.User.findOne({ where: { phone } });
      if (existingPhone) {
        throw new AppError('Your phone number already exists. Please use another phone number.', 409);
      }
    }

    if (!role) throw new AppError('Role is required for registration', 400);

    const validRoles = [ROLES.OWNER, ROLES.TENANT, ROLES.ADMIN];
    if (!validRoles.includes(String(role).toUpperCase())) {
      throw new AppError(`Role '${role}' is invalid. Valid roles are: ${validRoles.join(', ')}`, 400);
    }

    const roleRecord = await models.Role.findOne({ where: { role_name: role.toUpperCase() } });
    if (!roleRecord) {
      throw new AppError(`Role '${role}' is not available in roles table.`, 400);
    }

    const user = await models.User.create({
      email,
      password_hash: await hashPassword(rawPassword),
      first_name,
      last_name,
      phone,
      role_id: roleRecord.id,
    });

    // Generate and persist OTP; for development we will return the code in the API response
    try {
      const code = generateOTP();
      const expiresAt = getOTPExpiration(5);
      const otp = await models.OTP.create({
        email,
        code,
        purpose: OTP_PURPOSES.EMAIL_VERIFICATION,
        is_verified: false,
        attempts: 0,
        expires_at: expiresAt,
      });

      return { user, otp: { id: otp.id, code: otp.code, expiresIn: 5 * 60 } };
    } catch (otpPersistError) {
      console.error('[registerUser] OTP create failed:', otpPersistError.message);
      // Return user without otp if OTP creation fails
      return { user };
    }
  } catch (error) {
    console.error('registerUser service error:', error);
    throw error;
  }
};


export const loginUser = async ({ email, password_hash, rememberMe }, req) => {
  const user = await models.User.findOne({
    where: { email },
  });
  if (!user) throw new AppError("Invalid email or password. Please check your credentials and try again.", 401);

  const valid = await comparePassword(password_hash, user.password_hash);
  if (!valid) throw new AppError("Invalid email or password. Please check your credentials and try again.", 401);

  const emailVerified = await isOTPVerified(email, OTP_PURPOSES.EMAIL_VERIFICATION);
  if (!emailVerified) {
    throw new AppError('Email not verified. Please verify the OTP before signing in.', 401);
  }

  const deviceInfo = req ? {
    device: req.headers?.['user-agent'],
    ip: req.ip,
  } : {};

  const refreshToken = await generateRefreshToken(user.id, rememberMe, deviceInfo);

  return {
    user,
    accessToken: signAccessToken(user),
    refreshToken,
  };
};


export const verifyRefreshToken = async token => {
  try {
    if (!token) throw new AppError('Refresh token missing', 401);

    const record = await models.RefreshToken.findOne({ where: { token } });
    if (!record || record.revoked_at || record.expires_at < new Date()) {
      throw new AppError('Invalid refresh token', 403);
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return payload.user_id;
    } catch {
      throw new AppError('Invalid refresh token', 403);
    }
  } catch (error) {
    console.error('verifyRefreshToken service error:', error);
    throw error;
  }
};

// Rotate refresh token - verify current token, revoke it, and generate new one
export const rotateRefreshToken = async (token, req) => {
  try {
    if (!token) throw new AppError('Refresh token missing', 401);

    // Find the refresh token record
    const record = await models.RefreshToken.findOne({ where: { token } });
    if (!record || record.revoked_at || record.expires_at < new Date()) {
      throw new AppError('Invalid or expired refresh token', 403);
    }

    // Verify JWT signature
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid refresh token', 403);
    }

    const userId = payload.user_id;

    // Get user
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 401);

    // Revoke the old token
    await models.RefreshToken.update(
      { revoked_at: new Date() },
      { where: { token } }
    );

    // Generate new access token
    const accessToken = jwt.sign(
      {
        user_id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Generate new refresh token
    const deviceInfo = req ? {
      device: req.headers?.['user-agent'],
      ip: req.ip,
    } : {};

    const newRefreshToken = await generateRefreshToken(user.id, false, deviceInfo);

    return { accessToken, newRefreshToken };
  } catch (error) {
    console.error('rotateRefreshToken service error:', error);
    throw error;
  }
};

export const revokeRefreshToken = async token => {
  try {
    await models.RefreshToken.update(
      { revoked_at: new Date() },
      { where: { token } }
    );
  } catch (error) {
    console.error('revokeRefreshToken service error:', error);
    throw error;
  }
};

/* ----------------- helpers ----------------- */
const signAccessToken = user =>
  jwt.sign(
    {
      user_id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

const generateRefreshToken = async (user_id, rememberMe = false, { device, ip } = {}) => {
  const expiresInMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

  const token = jwt.sign({ user_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: rememberMe ? '30d' : '1d' });

  await models.RefreshToken.create({
    token,
    user_id,
    device,
    ip,
    expires_at: new Date(Date.now() + expiresInMs),
  });

  return token;
};
