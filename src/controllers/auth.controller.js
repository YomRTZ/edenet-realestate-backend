import * as service from '../services/auth.service.js'
import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../utils/AppError.js'

export const register = catchAsync(async (req, res) => {
  try {
    const result = await service.registerUser(req.body);
    const user = result.user || result;
    const otp = result.otp;

    const responseData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      message: 'Registration successful.',
    };

    // In development return the OTP in the response for easier testing
    if (process.env.NODE_ENV !== 'production' && otp) {
      responseData.otp = otp.code;
      responseData.otpExpiresIn = otp.expiresIn;
    }

    res.status(201).json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Register controller error:', error)
    throw error
  }
})

export const login = catchAsync(async (req, res) => {
  try {
    const { rememberMe } = req.body
    
    // Handle both password and password_hash (for frontend compatibility)
    const password = req.body.password || req.body.password_hash;
    
    const { user, accessToken, refreshToken } =
      await service.loginUser({ ...req.body, password_hash: password }, req)

    // Check if request is from same origin (browser) or different origin
    const isProduction = process.env.NODE_ENV === 'production';
    // Use 'Lax' for dev (localhost), 'none' for production (cross-origin)
    const sameSite = isProduction ? 'none' : 'Lax';

    // Set refresh token in HttpOnly cookie ONLY
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSite,
      path: '/',
      maxAge: rememberMe
        ? 30 * 24 * 60 * 60 * 1000 
        : 24 * 60 * 60 * 1000, 
    })

    // Return access token in response body (frontend will store in memory)
    // DO NOT return refreshToken in response body - only in HttpOnly cookie
    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Login controller error:', error)
    throw error
  }
})


export const refreshToken = catchAsync(async (req, res) => {
  try {
    // ONLY accept refresh token from cookie - reject from body for security
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new AppError('Refresh token missing. Please log in again.', 401)
    }

    // Verify the refresh token and get new access token (with rotation)
    const { accessToken, newRefreshToken } = await service.rotateRefreshToken(token, req)

    // Check if request is from same origin (browser) or different origin
    const isProduction = process.env.NODE_ENV === 'production';
    // Use 'Lax' for dev (localhost), 'none' for production (cross-origin)
    const sameSite = isProduction ? 'none' : 'Lax';

    // If rotation happened, set new refresh token cookie
    if (newRefreshToken) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: sameSite,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, 
      })
    }

    // Return new access token in response body (frontend stores in memory)
    res.json({
      success: true,
      data: { accessToken },
    })
  } catch (error) {
    // Don't log expected errors for missing refresh token
    if (error.message !== 'Refresh token missing. Please log in again.') {
      console.error('Refresh token controller error:', error)
    }
    
    // Clear the invalid refresh token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSite = isProduction ? 'none' : 'Lax';
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSite,
      path: '/',
    })
    
    throw error
  }
})


export const logout = catchAsync(async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (token) await service.revokeRefreshToken(token)

    // Check if request is from same origin (browser) or different origin
    const isProduction = process.env.NODE_ENV === 'production';
    // Use 'Lax' for dev (localhost), 'none' for production (cross-origin)
    const sameSite = isProduction ? 'none' : 'Lax';

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSite,
      path: '/',
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Logout controller error:', error)
    throw error
  }
})

export const getLoginActivity = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all refresh tokens for this user that haven't been revoked
    const refreshTokens = await models.RefreshToken.findAll({
      where: {
        user_id: userId,
        revoked_at: null, 
      },
      order: [['createdAt', 'DESC']],
      limit: 10, 
    });

    // Format the data for frontend
    const loginActivity = refreshTokens.map(token => ({
      id: token.id,
      device: token.device || 'Unknown Device',
      ip: token.ip || 'Unknown IP',
      createdAt: token.createdAt,
      lastUsed: token.createdAt, 
    }));

    res.json({
      success: true,
      data: loginActivity,
    });
  } catch (error) {
    console.error('Get login activity controller error:', error);
    throw error;
  }
});
