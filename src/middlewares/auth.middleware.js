import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Role } from '../models/role.model.js';
import { AppError } from '../utils/AppError.js';

export const verifyToken = async (req, res, next) => {
  // First, try to get token from Authorization header
  let token = req.headers.authorization?.split(' ')[1];
  
  // If no token in header, try to get from cookie
  if (!token && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  
  // If no token in header or cookie, try to get from query parameter
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  console.log('[verifyToken] Token present:', !!token);
  
  if (!token) return next(new AppError('Please sign in to access this page.', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[verifyToken] Decoded JWT:', decoded);
    
    // Handle both 'role' and 'role_name' keys for backward compatibility
    // Also handle array vs string for role
    let userRole = decoded.role_name || decoded.role;
    
    // If role is an array, use the first element
    if (Array.isArray(userRole)) {
      userRole = userRole[0];
    }
    
    req.user = {
      id: decoded.user_id,
      role: userRole
    };
    
    console.log('[verifyToken] req.user set:', req.user);

    next();
  } catch {
    console.error('[verifyToken] JWT verification failed');
    next(new AppError('Your session has expired. Please sign in again.', 401));
  }
};

// Helper function to verify token from request (header, cookie, or query)
// Returns user object if valid, null otherwise
export const verifyTokenFromRequest = async (req) => {
  // First, try to get token from Authorization header
  let token = req.headers.authorization?.split(' ')[1];
  
  // If no token in header, try to get from cookie
  if (!token && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  
  // If no token in header or cookie, try to get from query parameter
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle both 'role' and 'role_name' keys for backward compatibility
    // Also handle array vs string for role
    let userRole = decoded.role_name || decoded.role;
    
    // If role is an array, use the first element
    if (Array.isArray(userRole)) {
      userRole = userRole[0];
    }
    
    return {
      id: decoded.user_id,
      role: userRole
    };
  } catch {
    return null;
  }
};

// Helper function to check if user is admin
export const isUserAdmin = (user) => {
  if (!user) return false;
  const role = user.role;
  if (typeof role === 'string') {
    return role === 'admin';
  }
  if (Array.isArray(role)) {
    return role.includes('admin');
  }
  return false;
};


export const permit = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Unauthorized', 401));

  // Handle role as both string and array
  const userRole = req.user.role;
  const userRoles = Array.isArray(userRole) ? userRole : [userRole];
  
  // Check if user has any of the required roles
  const hasRole = userRoles.some(role => roles.includes(role));
  
  if (!hasRole) {
    return next(new AppError("You don't have permission to perform this action.", 403));
  }

  next();
};

