const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  // Owner of the outfit
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Basic outfit information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Outfit items
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WardrobeItem',
      required: true
    },
    position: {
      type: String,
      enum: ['top', 'bottom', 'outerwear', 'shoes', 'accessories', 'dress']
    },
    isCore: {
      type: Boolean,
      default: true // Whether this item is essential to the outfit
    }
  }],
  
  // Occasion and style
  occasion: {
    eventType: {
      type: String,
      required: true,
      enum: ['Work', 'Casual', 'Date Night', 'Party', 'Formal', 'Exercise', 'Travel', 'Wedding', 'Interview']
    },
    mood: {
      type: String,
      required: true,
      enum: ['Confident', 'Comfortable', 'Trendy', 'Classic', 'Bold', 'Relaxed', 'Professional', 'Romantic']
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'all-season']
    },
    weather: [{
      type: String,
      enum: ['hot', 'warm', 'cool', 'cold', 'rainy', 'windy', 'humid']
    }]
  },
  
  // AI generation data
  aiGenerated: {
    isAIGenerated: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    confidenceLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low']
    },
    reasoning: {
      type: String,
      maxlength: 1000
    },
    styleNotes: [String],
    algorithm: {
      version: String,
      parameters: mongoose.Schema.Types.Mixed
    },
    generatedAt: Date
  },
  
  // Images and visual representation
  images: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['photo', 'mirror-selfie', 'outfit-flat-lay', 'ai-generated'],
      default: 'photo'
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Usage and feedback
  usage: {
    timesWorn: {
      type: Number,
      default: 0
    },
    lastWorn: Date,
    occasions: [{
      date: Date,
      event: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      notes: String
    }]
  },
  
  // User feedback
  feedback: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    liked: {
      type: Boolean,
      default: null
    },
    tags: [{
      type: String,
      enum: ['love', 'like', 'ok', 'dislike', 'too-formal', 'too-casual', 'uncomfortable', 'perfect-fit', 'colors-great', 'style-mismatch']
    }],
    improvements: String,
    wouldWearAgain: {
      type: Boolean,
      default: null
    }
  },
  
  // Social features
  social: {
    isPublic: {
      type: Boolean,
      default: false
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    shares: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      platform: String,
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Organization and tags
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutfitCollection'
  }],
  
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'deleted'],
    default: 'active'
  },
  
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Color analysis
  colorPalette: [{
    color: String,
    percentage: Number
  }],
  
  // Style analysis
  styleAnalysis: {
    dominantStyle: String,
    formality: {
      type: Number,
      min: 0,
      max: 10 // 0 = very casual, 10 = very formal
    },
    versatility: {
      type: Number,
      min: 0,
      max: 10 // How versatile/adaptable the outfit is
    },
    uniqueness: {
      type: Number,
      min: 0,
      max: 10 // How unique/creative the combination is
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
outfitSchema.index({ userId: 1, status: 1 });
outfitSchema.index({ userId: 1, isFavorite: 1 });
outfitSchema.index({ 'occasion.eventType': 1 });
outfitSchema.index({ 'occasion.mood': 1 });
outfitSchema.index({ 'aiGenerated.isAIGenerated': 1 });
outfitSchema.index({ 'aiGenerated.score': -1 });
outfitSchema.index({ createdAt: -1 });
outfitSchema.index({ 'usage.timesWorn': -1 });
outfitSchema.index({ 'social.isPublic': 1 });

// Virtual for like count
outfitSchema.virtual('likeCount').get(function() {
  return this.social.likes.length;
});

// Virtual for comment count
outfitSchema.virtual('commentCount').get(function() {
  return this.social.comments.length;
});

// Virtual for primary image
outfitSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Virtual for outfit effectiveness score
outfitSchema.virtual('effectivenessScore').get(function() {
  let score = 0;
  
  // Base AI score
  if (this.aiGenerated.score) {
    score += this.aiGenerated.score * 0.4;
  }
  
  // User rating
  if (this.feedback.userRating) {
    score += (this.feedback.userRating / 5) * 30;
  }
  
  // Usage frequency
  if (this.usage.timesWorn > 0) {
    score += Math.min(this.usage.timesWorn * 5, 20);
  }
  
  // Social validation
  if (this.social.likes.length > 0) {
    score += Math.min(this.social.likes.length * 2, 10);
  }
  
  return Math.round(score);
});

// Pre-save middleware
outfitSchema.pre('save', function(next) {
  // Ensure only one primary image
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    this.images.forEach((img, index) => {
      img.isPrimary = index === 0;
    });
  } else if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }
  
  // Auto-generate tags based on occasion and items
  const autoTags = [
    this.occasion.eventType.toLowerCase(),
    this.occasion.mood.toLowerCase()
  ];
  
  if (this.occasion.season) {
    autoTags.push(this.occasion.season);
  }
  
  this.tags = [...new Set([...this.tags, ...autoTags])];
  
  next();
});

// Instance methods
outfitSchema.methods.markAsWorn = function(event = null, rating = null) {
  this.usage.timesWorn += 1;
  this.usage.lastWorn = new Date();
  
  if (event || rating) {
    this.usage.occasions.push({
      date: new Date(),
      event: event || 'General wear',
      rating: rating,
      notes: ''
    });
  }
  
  return this.save();
};

outfitSchema.methods.addLike = function(userId) {
  const existingLike = this.social.likes.find(like => 
    like.userId.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.social.likes.push({ userId });
  }
  
  return this.save();
};

outfitSchema.methods.removeLike = function(userId) {
  this.social.likes = this.social.likes.filter(like => 
    like.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

outfitSchema.methods.addComment = function(userId, text) {
  this.social.comments.push({
    userId,
    text,
    createdAt: new Date()
  });
  
  return this.save();
};

outfitSchema.methods.updateFeedback = function(feedbackData) {
  this.feedback = {
    ...this.feedback,
    ...feedbackData
  };
  
  return this.save();
};

outfitSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

// Static methods
outfitSchema.statics.findByUserId = function(userId, filters = {}) {
  const query = { userId, status: 'active', ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

outfitSchema.statics.findByOccasion = function(userId, eventType, mood = null) {
  const query = {
    userId,
    status: 'active',
    'occasion.eventType': eventType
  };
  
  if (mood) {
    query['occasion.mood'] = mood;
  }
  
  return this.find(query).sort({ 'aiGenerated.score': -1 });
};

outfitSchema.statics.findFavorites = function(userId) {
  return this.find({
    userId,
    status: 'active',
    isFavorite: true
  }).sort({ updatedAt: -1 });
};

outfitSchema.statics.findMostWorn = function(userId, limit = 10) {
  return this.find({
    userId,
    status: 'active'
  })
  .sort({ 'usage.timesWorn': -1 })
  .limit(limit);
};

outfitSchema.statics.findBestRated = function(userId, limit = 10) {
  return this.find({
    userId,
    status: 'active',
    'feedback.userRating': { $exists: true }
  })
  .sort({ 'feedback.userRating': -1 })
  .limit(limit);
};

outfitSchema.statics.findPublicOutfits = function(limit = 20) {
  return this.find({
    'social.isPublic': true,
    status: 'active'
  })
  .populate('userId', 'displayName username profilePicture')
  .sort({ 'social.likes.length': -1, createdAt: -1 })
  .limit(limit);
};

outfitSchema.statics.findSimilarOutfits = function(userId, outfitId, limit = 5) {
  // This would implement similarity logic based on items, colors, style, etc.
  return this.findById(outfitId)
    .then(outfit => {
      if (!outfit) return [];
      
      return this.find({
        userId,
        _id: { $ne: outfitId },
        status: 'active',
        $or: [
          { 'occasion.eventType': outfit.occasion.eventType },
          { 'occasion.mood': outfit.occasion.mood },
          { tags: { $in: outfit.tags } }
        ]
      })
      .limit(limit);
    });
};

module.exports = mongoose.model('Outfit', outfitSchema);