import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { generateOTP, getOTPExpiration } from '../utils/otp.js';
import { OTP_PURPOSES } from '../constants/seeds.js';
// Email integration removed — OTP codes are persisted and returned by API in development

const MAX_ATTEMPTS = 5;

/* Request OTP for email */
export const requestOTP = async (email, purpose = OTP_PURPOSES.EMAIL_VERIFICATION) => {
  try {
    // Check if user exists
    const user = await models.User.findOne({ where: { email } });
    if (!user && purpose !== OTP_PURPOSES.EMAIL_VERIFICATION) {
      throw new AppError('User not found', 404);
    }

    // Check if there's an existing unverified OTP from last 2 minutes
    const existingOTP = await models.OTP.findOne({
      where: {
        email,
        purpose,
        is_verified: false,
        createdAt: {
          [models.sequelize.Sequelize.Op.gt]: new Date(Date.now() - 2 * 60000),
        },
      },
    });

    if (existingOTP) {
      throw new AppError('OTP already sent. Please wait 2 minutes before requesting again.', 429);
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = getOTPExpiration(5);

    // Create OTP record
    const otp = await models.OTP.create({
      email,
      code,
      purpose,
      is_verified: false,
      attempts: 0,
      expires_at: expiresAt,
    });

    // Previously sent via email; now we persist the OTP and return its id to caller

    return {
      success: true,
      message: 'OTP sent to email',
      otpId: otp.id,
      expiresIn: 5 * 60, // 5 minutes in seconds
    };
  } catch (error) {
    console.error('[requestOTP] Error:', error.message);
    throw error;
  }
};

/* Verify OTP code */
export const verifyOTP = async (email, code, purpose = OTP_PURPOSES.EMAIL_VERIFICATION) => {
  try {
    const otp = await models.OTP.findOne({
      where: {
        email,
        purpose,
        is_verified: false,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otp) {
      throw new AppError('OTP not found or already verified', 404);
    }

    // Check if OTP has expired
    if (new Date() > otp.expires_at) {
      throw new AppError('OTP has expired', 410);
    }

    // Check max attempts
    if (otp.attempts >= MAX_ATTEMPTS) {
      throw new AppError('Maximum OTP verification attempts exceeded. Please request a new OTP.', 429);
    }

    // Increment attempts
    otp.attempts += 1;
    await otp.save();

    // Verify OTP code
    if (otp.code !== code) {
      throw new AppError('Invalid OTP code', 401);
    }

    // Mark as verified
    otp.is_verified = true;
    await otp.save();

    return {
      success: true,
      message: 'OTP verified successfully',
      otpId: otp.id,
    };
  } catch (error) {
    console.error('[verifyOTP] Error:', error.message);
    throw error;
  }
};

export const checkOTP = async (email, purpose = OTP_PURPOSES.EMAIL_VERIFICATION) => {
  try {
    const otp = await models.OTP.findOne({
      where: { email, purpose },
      order: [['createdAt', 'DESC']],
    });

    if (!otp) {
      return {
        success: true,
        data: {
          verified: false,
          expired: false,
          message: 'No OTP found for this email and purpose.',
        },
      };
    }

    const now = new Date();
    const expired = now > otp.expires_at;

    return {
      success: true,
      data: {
        verified: otp.is_verified,
        expired,
        expiresAt: otp.expires_at,
        message: otp.is_verified
          ? 'OTP has already been verified.'
          : expired
          ? 'OTP has expired.'
          : 'OTP is pending verification.',
      },
    };
  } catch (error) {
    console.error('[checkOTP] Error:', error.message);
    throw error;
  }
};

export const declineOTP = async (email, purpose = OTP_PURPOSES.EMAIL_VERIFICATION) => {
  try {
    const otp = await models.OTP.findOne({
      where: { email, purpose, is_verified: false },
      order: [['createdAt', 'DESC']],
    });

    if (!otp) {
      throw new AppError('No pending OTP found to decline.', 404);
    }

    otp.expires_at = new Date();
    await otp.save();

    return {
      success: true,
      message: 'OTP declined and invalidated successfully.',
    };
  } catch (error) {
    console.error('[declineOTP] Error:', error.message);
    throw error;
  }
};

/* Check if OTP is verified */
export const isOTPVerified = async (email, purpose = OTP_PURPOSES.EMAIL_VERIFICATION) => {
  try {
    const otp = await models.OTP.findOne({
      where: {
        email,
        purpose,
        is_verified: true,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otp) return false;

    // Check if verified within last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60000);
    return otp.createdAt > tenMinutesAgo;
  } catch (error) {
    console.error('[isOTPVerified] Error:', error.message);
    return false;
  }
};

/* Clean up expired OTPs */
export const cleanupExpiredOTPs = async () => {
  try {
    await models.OTP.destroy({
      where: {
        expires_at: {
          [models.sequelize.Sequelize.Op.lt]: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('[cleanupExpiredOTPs] Error:', error.message);
  }
};
