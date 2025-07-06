const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyIdToken, createCustomToken } = require('../config/firebase');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user with Firebase token
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { idToken, displayName, username } = req.body;

  if (!idToken || !displayName) {
    return res.status(400).json({
      success: false,
      message: 'ID token and display name are required'
    });
  }

  // Verify Firebase token
  const decodedToken = await verifyIdToken(idToken);
  
  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Firebase token'
    });
  }

  // Check if user already exists
  const existingUser = await User.findByFirebaseUid(decodedToken.uid);
  
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Check username availability if provided
  if (username) {
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }
  }

  // Create new user
  const user = new User({
    firebaseUid: decodedToken.uid,
    email: decodedToken.email,
    displayName,
    username: username ? username.toLowerCase() : null,
    isVerified: decodedToken.email_verified || false
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        isVerified: user.isVerified
      }
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user with Firebase token
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'ID token is required'
    });
  }

  // Verify Firebase token
  const decodedToken = await verifyIdToken(idToken);
  
  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Firebase token'
    });
  }

  // Find user in database
  const user = await User.findByFirebaseUid(decodedToken.uid);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found. Please register first.'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Update last active
  user.lastActive = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        isVerified: user.isVerified,
        subscription: user.subscription,
        stats: user.stats
      }
    }
  });
}));

module.exports = router;