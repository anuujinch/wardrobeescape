const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema({
  // Owner of the item
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Basic item information
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
  
  // Category and classification
  category: {
    type: String,
    required: true,
    enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'],
    index: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  // Style attributes
  style: {
    type: String,
    enum: ['casual', 'formal', 'business', 'party', 'athletic', 'loungewear', 'bohemian', 'trendy', 'classic']
  },
  
  // Color information
  colors: [{
    primary: {
      type: String,
      required: true,
      lowercase: true
    },
    secondary: String,
    pattern: {
      type: String,
      enum: ['solid', 'striped', 'polka-dot', 'floral', 'geometric', 'animal-print', 'abstract']
    }
  }],
  
  // Material and care
  material: {
    fabric: {
      type: String,
      enum: ['cotton', 'polyester', 'wool', 'silk', 'linen', 'denim', 'leather', 'synthetic', 'blend']
    },
    texture: {
      type: String,
      enum: ['smooth', 'rough', 'soft', 'stiff', 'stretchy', 'knit', 'woven']
    },
    careInstructions: String
  },
  
  // Fit and sizing
  size: {
    type: String,
    trim: true
  },
  
  fit: {
    type: String,
    enum: ['tight', 'fitted', 'regular', 'loose', 'oversized']
  },
  
  // Seasonal information
  season: [{
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'all-season']
  }],
  
  weather: [{
    type: String,
    enum: ['hot', 'warm', 'cool', 'cold', 'rainy', 'windy', 'humid']
  }],
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
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
  
  // Purchase information
  purchase: {
    brand: String,
    store: String,
    price: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    purchaseDate: Date,
    isGift: {
      type: Boolean,
      default: false
    }
  },
  
  // Usage tracking
  usage: {
    timesWorn: {
      type: Number,
      default: 0
    },
    lastWorn: Date,
    totalOutfits: {
      type: Number,
      default: 0
    },
    favoriteCount: {
      type: Number,
      default: 0
    }
  },
  
  // AI analysis results
  aiAnalysis: {
    detectedColors: [String],
    detectedStyle: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    tags: [String],
    analyzedAt: Date
  },
  
  // Organization
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
wardrobeItemSchema.index({ userId: 1, category: 1 });
wardrobeItemSchema.index({ userId: 1, isActive: 1 });
wardrobeItemSchema.index({ colors: 1 });
wardrobeItemSchema.index({ style: 1 });
wardrobeItemSchema.index({ season: 1 });
wardrobeItemSchema.index({ createdAt: -1 });
wardrobeItemSchema.index({ 'usage.timesWorn': -1 });

// Virtual for primary image
wardrobeItemSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Virtual for usage score (combination of times worn and total outfits)
wardrobeItemSchema.virtual('usageScore').get(function() {
  return this.usage.timesWorn + (this.usage.totalOutfits * 0.5);
});

// Pre-save middleware
wardrobeItemSchema.pre('save', function(next) {
  // Ensure only one primary image
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    this.images.forEach((img, index) => {
      img.isPrimary = index === 0;
    });
  } else if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }
  
  // Update tags based on AI analysis
  if (this.aiAnalysis && this.aiAnalysis.tags) {
    this.tags = [...new Set([...this.tags, ...this.aiAnalysis.tags])];
  }
  
  next();
});

// Instance methods
wardrobeItemSchema.methods.incrementUsage = function() {
  this.usage.timesWorn += 1;
  this.usage.lastWorn = new Date();
  return this.save();
};

wardrobeItemSchema.methods.addToOutfit = function() {
  this.usage.totalOutfits += 1;
  return this.save();
};

wardrobeItemSchema.methods.addFavorite = function() {
  this.usage.favoriteCount += 1;
  return this.save();
};

wardrobeItemSchema.methods.removeFavorite = function() {
  if (this.usage.favoriteCount > 0) {
    this.usage.favoriteCount -= 1;
  }
  return this.save();
};

wardrobeItemSchema.methods.updateAIAnalysis = function(analysis) {
  this.aiAnalysis = {
    ...analysis,
    analyzedAt: new Date()
  };
  return this.save();
};

// Static methods
wardrobeItemSchema.statics.findByUserId = function(userId, filters = {}) {
  const query = { userId, isActive: true, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

wardrobeItemSchema.statics.findByCategory = function(userId, category) {
  return this.find({ 
    userId, 
    category, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

wardrobeItemSchema.statics.findByColors = function(userId, colors) {
  return this.find({
    userId,
    'colors.primary': { $in: colors },
    isActive: true
  });
};

wardrobeItemSchema.statics.findBySeason = function(userId, season) {
  return this.find({
    userId,
    season: season,
    isActive: true
  });
};

wardrobeItemSchema.statics.findMostWorn = function(userId, limit = 10) {
  return this.find({ userId, isActive: true })
    .sort({ 'usage.timesWorn': -1 })
    .limit(limit);
};

wardrobeItemSchema.statics.findUnused = function(userId, days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    userId,
    isActive: true,
    $or: [
      { 'usage.lastWorn': { $lt: cutoffDate } },
      { 'usage.lastWorn': null }
    ]
  });
};

wardrobeItemSchema.statics.searchItems = function(userId, query) {
  return this.find({
    userId,
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
      { 'purchase.brand': { $regex: query, $options: 'i' } }
    ]
  });
};

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);