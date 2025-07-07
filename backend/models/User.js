const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Firebase UID for authentication
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic user information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but still enforces uniqueness
    trim: true,
    lowercase: true,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/ // Only alphanumeric and underscore
  },
  
  // Profile information
  profilePicture: {
    type: String,
    default: null
  },
  
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  
  // Style preferences
  stylePreferences: {
    favoriteColors: [{
      type: String,
      lowercase: true
    }],
    preferredStyles: [{
      type: String,
      enum: ['casual', 'formal', 'trendy', 'classic', 'bohemian', 'minimalist', 'edgy', 'romantic']
    }],
    bodyType: {
      type: String,
      enum: ['apple', 'pear', 'hourglass', 'rectangle', 'inverted-triangle'],
      default: null
    },
    sizeInfo: {
      tops: String,
      bottoms: String,
      shoes: String,
      dresses: String
    }
  },
  
  // App usage statistics
  stats: {
    outfitsGenerated: {
      type: Number,
      default: 0
    },
    photosUploaded: {
      type: Number,
      default: 0
    },
    wardrobeItems: {
      type: Number,
      default: 0
    },
    favoriteOutfits: {
      type: Number,
      default: 0
    }
  },
  
  // Subscription and premium features
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    expiresAt: Date,
    stripeCustomerId: String,
    subscriptionId: String
  },
  
  // Privacy and notification settings
  settings: {
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      shareOutfits: {
        type: Boolean,
        default: true
      }
    },
    notifications: {
      dailyOutfits: {
        type: Boolean,
        default: true
      },
      newFeatures: {
        type: Boolean,
        default: true
      },
      socialUpdates: {
        type: Boolean,
        default: false
      },
      pushToken: String // For push notifications
    }
  },
  
  // Social features
  social: {
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });

// Virtual for follower count
userSchema.virtual('followerCount').get(function() {
  return this.social.followers.length;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.social.following.length;
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Update lastActive timestamp
  this.lastActive = new Date();
  next();
});

// Instance methods
userSchema.methods.updateStats = function(statType, increment = 1) {
  if (this.stats.hasOwnProperty(statType)) {
    this.stats[statType] += increment;
  }
  return this.save();
};

userSchema.methods.follow = function(userId) {
  if (!this.social.following.includes(userId)) {
    this.social.following.push(userId);
  }
  return this.save();
};

userSchema.methods.unfollow = function(userId) {
  this.social.following = this.social.following.filter(
    id => !id.equals(userId)
  );
  return this.save();
};

userSchema.methods.addFollower = function(userId) {
  if (!this.social.followers.includes(userId)) {
    this.social.followers.push(userId);
  }
  return this.save();
};

userSchema.methods.removeFollower = function(userId) {
  this.social.followers = this.social.followers.filter(
    id => !id.equals(userId)
  );
  return this.save();
};

// Static methods
userSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.searchUsers = function(query) {
  return this.find({
    $or: [
      { displayName: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  }).limit(20);
};

module.exports = mongoose.model('User', userSchema);