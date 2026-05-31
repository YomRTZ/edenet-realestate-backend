import { AppError } from '../utils/AppError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Default values
  error.statusCode = error.statusCode || 500;
  error.message = error.message || 'Internal server error';

  // Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors?.map(errorItem => errorItem.path).filter(Boolean) || [];
    let message = 'Duplicate field value';

    if (fields.includes('email')) {
      message = 'Email already exists. Please use another email or log in instead.';
    } else if (fields.includes('phone_number')) {
      message = 'Your phone number already exists. Please use another phone number.';
    } else if (fields.length > 0) {
      message = `Duplicate value for: ${fields.join(', ')}`;
    }

    error = new AppError(message, 409);
  }

  if (err.name === 'SequelizeValidationError') {
    error = new AppError(err.errors[0].message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // DEV vs PROD
  if (process.env.NODE_ENV === 'development') {
    // Don't log 401 errors for refresh token endpoint (expected when no session)
    if (!(error.statusCode === 401 && req.originalUrl === '/auth/refresh-token')) {
      console.error('🔥 ERROR:', err);
    }

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      stack: err.stack,
    });
  }

  // PRODUCTION
if (process.env.NODE_ENV === 'production') {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Unknown / programming error
  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
}
};
