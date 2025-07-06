const mongoose = require('mongoose');

/**
 * Global error handling middleware
 * Processes all errors and returns consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      code: 'INVALID_ID'
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = {
      message,
      statusCode: 400,
      code: 'DUPLICATE_FIELD'
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Firebase auth errors
  if (err.code && err.code.startsWith('auth/')) {
    const message = getFirebaseErrorMessage(err.code);
    error = {
      message,
      statusCode: 401,
      code: 'FIREBASE_AUTH_ERROR'
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      message,
      statusCode: 400,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = {
      message,
      statusCode: 400,
      code: 'TOO_MANY_FILES'
    };
  }

  // Network and external service errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    const message = 'External service unavailable';
    error = {
      message,
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE'
    };
  }

  // Rate limiting errors
  if (err.code === 'TOO_MANY_REQUESTS') {
    const message = 'Too many requests, please try again later';
    error = {
      message,
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Set default values
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';

  // Create error response
  const errorResponse = {
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  };

  // Add additional context for specific errors
  if (statusCode === 400) {
    errorResponse.type = 'ValidationError';
  } else if (statusCode === 401) {
    errorResponse.type = 'AuthenticationError';
  } else if (statusCode === 403) {
    errorResponse.type = 'AuthorizationError';
  } else if (statusCode === 404) {
    errorResponse.type = 'NotFoundError';
  } else if (statusCode === 429) {
    errorResponse.type = 'RateLimitError';
    errorResponse.retryAfter = err.retryAfter || 60;
  } else if (statusCode >= 500) {
    errorResponse.type = 'ServerError';
  }

  // Log severe errors (500+) to monitoring service
  if (statusCode >= 500) {
    logSevereError(err, req, errorResponse);
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Convert Firebase error codes to user-friendly messages
 */
const getFirebaseErrorMessage = (code) => {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password is too weak',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/id-token-expired': 'Your session has expired. Please log in again',
    'auth/id-token-revoked': 'Your session has been revoked. Please log in again',
    'auth/invalid-id-token': 'Invalid session token. Please log in again'
  };

  return errorMessages[code] || 'Authentication error occurred';
};

/**
 * Log severe errors to external monitoring service
 */
const logSevereError = (err, req, errorResponse) => {
  // In production, you would send this to services like:
  // - Sentry
  // - LogRocket
  // - Datadog
  // - CloudWatch
  
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: err.message,
    stack: err.stack,
    code: errorResponse.code,
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: {
        'user-agent': req.get('user-agent'),
        'content-type': req.get('content-type')
      },
      body: req.method !== 'GET' ? req.body : undefined,
      params: req.params,
      query: req.query,
      userId: req.user?.id || null
    },
    environment: process.env.NODE_ENV,
    server: {
      hostname: require('os').hostname(),
      platform: require('os').platform(),
      arch: require('os').arch()
    }
  };

  // For now, just log to console
  // In production, replace with your monitoring service
  console.error('SEVERE ERROR:', JSON.stringify(errorLog, null, 2));
};

/**
 * Async error wrapper for route handlers
 * Eliminates need for try-catch in every async route
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 error handler for routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error helper
 */
const createValidationError = (message, field = null) => {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  if (field) {
    error.field = field;
  }
  return error;
};

/**
 * Authentication error helper
 */
const createAuthError = (message = 'Authentication required') => {
  return new AppError(message, 401, 'AUTH_ERROR');
};

/**
 * Authorization error helper
 */
const createAuthorizationError = (message = 'Access denied') => {
  return new AppError(message, 403, 'AUTHORIZATION_ERROR');
};

/**
 * Not found error helper
 */
const createNotFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  AppError,
  createValidationError,
  createAuthError,
  createAuthorizationError,
  createNotFoundError
};