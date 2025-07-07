const { verifyIdToken } = require('../config/firebase');
const User = require('../models/User');

/**
 * Authentication middleware for protected routes
 * Verifies Firebase ID token and attaches user to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }
    
    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }
    
    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Find user in database
    const user = await User.findByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please create an account.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }
    
    // Attach user information to request
    req.user = {
      id: user._id,
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || user.email,
      displayName: user.displayName,
      isVerified: user.isVerified,
      subscription: user.subscription
    };
    
    // Update user's last active timestamp (optional, might be too frequent)
    // await user.updateOne({ lastActive: new Date() });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific Firebase errors
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication service error.',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is provided but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decodedToken = await verifyIdToken(token);
    
    if (decodedToken) {
      const user = await User.findByFirebaseUid(decodedToken.uid);
      
      if (user && user.isActive) {
        req.user = {
          id: user._id,
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || user.email,
          displayName: user.displayName,
          isVerified: user.isVerified,
          subscription: user.subscription
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    req.user = null;
    next();
  }
};

/**
 * Admin-only middleware
 * Requires authentication and admin privileges
 */
const adminOnly = async (req, res, next) => {
  try {
    // First run auth middleware
    await authMiddleware(req, res, () => {});
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Check if user has admin privileges
    const user = await User.findById(req.user.id);
    
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.',
        code: 'ADMIN_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization service error.',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Premium subscription middleware
 * Requires active premium subscription
 */
const premiumOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }
  
  const { subscription } = req.user;
  
  if (!subscription || subscription.type === 'free') {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required for this feature.',
      code: 'PREMIUM_REQUIRED'
    });
  }
  
  // Check if subscription is expired
  if (subscription.expiresAt && new Date() > subscription.expiresAt) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription has expired.',
      code: 'SUBSCRIPTION_EXPIRED'
    });
  }
  
  next();
};

/**
 * Rate limiting by user ID
 * Uses user-specific rate limiting instead of IP-based
 */
const userRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId);
      const filteredRequests = requests.filter(time => time > windowStart);
      userRequests.set(userId, filteredRequests);
    } else {
      userRequests.set(userId, []);
    }
    
    const userRequestCount = userRequests.get(userId).length;
    
    if (userRequestCount >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        code: 'USER_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    userRequests.get(userId).push(now);
    
    next();
  };
};

/**
 * Validate user ownership of resource
 * Ensures user can only access their own resources
 */
const validateResourceOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        });
      }
      
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Check ownership
      if (resource.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }
      
      // Attach resource to request for later use
      req.resource = resource;
      
      next();
    } catch (error) {
      console.error('Resource ownership validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Resource validation error.',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminOnly,
  premiumOnly,
  userRateLimit,
  validateResourceOwnership
};