const cors = require('cors');

// iOS-specific configuration
const iOSConfig = {
  // CORS configuration for iOS
  cors: {
    origin: function (origin, callback) {
      // Allow requests from iOS simulator, device, and TestFlight
      const allowedOrigins = [
        'http://localhost:19006', // Expo web
        'exp://127.0.0.1:19000', // iOS Simulator
        'exp://localhost:19000', // iOS Simulator
        'https://expo.dev', // Expo Go
        'https://expo.io', // Expo Go
        /^exp:\/\/.*\.exp\.direct$/, // Expo tunnel
        /^https:\/\/.*\.expo\.dev$/, // Expo development
        /^https:\/\/.*\.expo\.io$/, // Expo development
        /^wardrobeescape:\/\/.*/, // Deep links
        // Add your production domains here
        'https://wardrobeescape.com',
        'https://api.wardrobeescape.com',
      ];

      // Allow requests with no origin (mobile apps)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list or matches pattern
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name',
      'X-File-Size',
      'X-File-Type',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  },

  // Security headers for iOS
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // Rate limiting for iOS
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Higher limit for mobile apps
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 900, // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
  },

  // File upload configuration for iOS
  upload: {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
      fields: 10,
      fieldSize: 1024 * 1024, // 1MB
    },
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic', // iOS specific
      'image/heif', // iOS specific
    ],
    fileFilter: (req, file, cb) => {
      const allowedTypes = iOSConfig.upload.allowedMimeTypes;
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
      }
    },
  },

  // Database configuration for iOS
  database: {
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      bufferMaxEntries: 0,
      bufferCommands: false,
    },
  },

  // Health check configuration
  health: {
    checks: {
      database: true,
      redis: false, // Set to true if using Redis
      storage: true,
      ai: true,
    },
  },

  // Logging configuration
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: 'combined',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // Session configuration (if using sessions)
  session: {
    secret: process.env.SESSION_SECRET || 'wardrobe-escape-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  },

  // Error handling configuration
  errorHandler: {
    includeStack: process.env.NODE_ENV !== 'production',
    logErrors: true,
    logErrorDetails: process.env.NODE_ENV !== 'production',
  },
};

module.exports = iOSConfig;