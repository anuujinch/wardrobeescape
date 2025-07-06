const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { userRateLimit } = require('../middleware/auth');
const WardrobeItem = require('../models/WardrobeItem');
const Outfit = require('../models/Outfit');
const User = require('../models/User');

const router = express.Router();

// Rate limiting for AI endpoints (more restrictive)
const aiRateLimit = userRateLimit(5 * 60 * 1000, 20); // 20 requests per 5 minutes

/**
 * Enhanced AI Outfit Recommendation Service (Server-side)
 */
class ServerAIOutfitRecommendationService {
  static OUTFIT_COMBINATIONS = {
    Work: {
      required: ['Tops', 'Bottoms'],
      optional: ['Outerwear', 'Shoes', 'Accessories'],
      excludes: ['casual', 'athletic']
    },
    Casual: {
      required: ['Tops'],
      optional: ['Bottoms', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['formal']
    },
    'Date Night': {
      required: ['Tops', 'Bottoms'],
      optional: ['Dresses', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['athletic', 'loungewear']
    },
    Party: {
      required: ['Tops'],
      optional: ['Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['athletic']
    },
    Formal: {
      required: ['Tops', 'Bottoms'],
      optional: ['Dresses', 'Outerwear', 'Shoes', 'Accessories'],
      excludes: ['casual', 'athletic']
    },
    Exercise: {
      required: ['Tops', 'Bottoms'],
      optional: ['Outerwear', 'Shoes'],
      excludes: ['formal', 'delicate']
    }
  };

  static MOOD_STYLES = {
    Confident: {
      keywords: ['bold', 'structured', 'statement', 'sharp', 'commanding'],
      colors: ['black', 'red', 'navy', 'white'],
      avoid: ['oversized', 'muted']
    },
    Comfortable: {
      keywords: ['soft', 'relaxed', 'cozy', 'loose', 'breathable'],
      colors: ['neutral', 'earth tones', 'pastels'],
      avoid: ['tight', 'restrictive']
    },
    Trendy: {
      keywords: ['current', 'fashionable', 'stylish', 'contemporary', 'chic'],
      colors: ['seasonal', 'on-trend'],
      avoid: ['outdated', 'basic']
    },
    Classic: {
      keywords: ['timeless', 'elegant', 'refined', 'sophisticated'],
      colors: ['neutral', 'black', 'white', 'navy'],
      avoid: ['trendy', 'flashy']
    },
    Bold: {
      keywords: ['vibrant', 'daring', 'eye-catching', 'unique'],
      colors: ['bright', 'contrasting', 'neon'],
      avoid: ['subtle', 'muted']
    },
    Relaxed: {
      keywords: ['easygoing', 'casual', 'comfortable', 'laid-back'],
      colors: ['soft', 'muted', 'neutral'],
      avoid: ['formal', 'structured']
    }
  };

  static async generateRecommendations(wardrobeItems, preferences, user) {
    const recommendations = [];
    
    // Group items by category
    const itemsByCategory = this.groupItemsByCategory(wardrobeItems);
    
    // Generate multiple outfit combinations
    const combinations = this.generateCombinations(itemsByCategory, preferences);
    
    // Score and rank each combination
    for (let i = 0; i < combinations.length; i++) {
      const combo = combinations[i];
      const score = this.calculateOutfitScore(combo, preferences, user);
      const reasoning = this.generateReasoning(combo, preferences);
      const styleNotes = this.generateStyleNotes(combo, preferences);
      const confidenceLevel = this.calculateConfidenceLevel(score, combo.length);
      
      recommendations.push({
        id: `outfit-${i + 1}`,
        items: combo,
        score,
        reasoning,
        styleNotes,
        confidenceLevel,
        algorithm: {
          version: '1.0',
          parameters: preferences
        }
      });
    }
    
    // Sort by score and return top 3
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  static groupItemsByCategory(items) {
    const grouped = new Map();
    
    items.forEach(item => {
      const category = item.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category).push(item);
    });
    
    return grouped;
  }

  static generateCombinations(itemsByCategory, preferences) {
    const combinations = [];
    const eventRules = this.OUTFIT_COMBINATIONS[preferences.eventType];
    
    if (!eventRules) return combinations;
    
    // Generate up to 5 different combinations
    for (let i = 0; i < 5; i++) {
      const combination = [];
      
      // Add required items
      eventRules.required.forEach(category => {
        const items = itemsByCategory.get(category) || [];
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          combination.push(randomItem);
        }
      });
      
      // Add optional items (randomly)
      eventRules.optional.forEach(category => {
        const items = itemsByCategory.get(category) || [];
        if (items.length > 0 && Math.random() > 0.4) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          combination.push(randomItem);
        }
      });
      
      if (combination.length >= 2) {
        combinations.push(combination);
      }
    }
    
    return combinations;
  }

  static calculateOutfitScore(items, preferences, user) {
    let score = 0;
    
    // Base score for having items
    score += items.length * 10;
    
    // Event type compatibility
    const eventRules = this.OUTFIT_COMBINATIONS[preferences.eventType];
    if (eventRules) {
      const categories = items.map(item => item.category);
      const hasAllRequired = eventRules.required.every(cat => categories.includes(cat));
      score += hasAllRequired ? 30 : -20;
    }
    
    // Mood compatibility
    const moodStyle = this.MOOD_STYLES[preferences.mood];
    if (moodStyle) {
      items.forEach(item => {
        const itemName = item.name.toLowerCase();
        const hasPositiveKeywords = moodStyle.keywords.some(keyword => 
          itemName.includes(keyword.toLowerCase())
        );
        const hasNegativeKeywords = moodStyle.avoid.some(keyword => 
          itemName.includes(keyword.toLowerCase())
        );
        
        if (hasPositiveKeywords) score += 15;
        if (hasNegativeKeywords) score -= 10;
      });
    }
    
    // User preference bonus
    if (user.stylePreferences) {
      items.forEach(item => {
        // Check if item matches user's preferred styles
        if (user.stylePreferences.preferredStyles.includes(item.style)) {
          score += 10;
        }
        
        // Check color preferences
        if (item.colors && item.colors.length > 0) {
          const itemColors = item.colors.map(c => c.primary);
          const matchingColors = itemColors.filter(color => 
            user.stylePreferences.favoriteColors.includes(color)
          );
          score += matchingColors.length * 5;
        }
      });
    }
    
    // Usage history bonus
    items.forEach(item => {
      if (item.usage.timesWorn > 0) {
        score += Math.min(item.usage.timesWorn, 10);
      }
    });
    
    // Variety bonus
    const uniqueCategories = new Set(items.map(item => item.category));
    score += uniqueCategories.size * 5;
    
    return Math.max(0, score);
  }

  static generateReasoning(items, preferences) {
    const categories = items.map(item => item.category);
    const eventType = preferences.eventType.toLowerCase();
    const mood = preferences.mood.toLowerCase();
    
    const reasons = [
      `This outfit combines ${categories.join(', ')} perfectly for a ${eventType} occasion.`,
      `The ${mood} mood is reflected in the sophisticated combination of these pieces.`,
      `This combination balances style and comfort for your ${eventType} event.`,
      `The selected items work harmoniously together to create a ${mood} look.`
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  static generateStyleNotes(items, preferences) {
    const notes = [];
    
    // Add mood-specific styling tips
    const moodStyle = this.MOOD_STYLES[preferences.mood];
    if (moodStyle) {
      notes.push(`For a ${preferences.mood.toLowerCase()} look, focus on ${moodStyle.keywords.slice(0, 2).join(' and ')} elements.`);
    }
    
    // Add accessory suggestions
    const hasAccessories = items.some(item => item.category === 'Accessories');
    if (!hasAccessories) {
      notes.push('Consider adding accessories to complete the look.');
    }
    
    // Add color coordination tips
    const colors = items.flatMap(item => item.colors ? item.colors.map(c => c.primary) : []);
    const uniqueColors = [...new Set(colors)];
    if (uniqueColors.length <= 2) {
      notes.push('The color palette is cohesive and balanced.');
    } else if (uniqueColors.length > 3) {
      notes.push('Try limiting to 2-3 main colors for a more polished look.');
    }
    
    return notes;
  }

  static calculateConfidenceLevel(score, itemCount) {
    if (score >= 80 && itemCount >= 3) return 'High';
    if (score >= 50 && itemCount >= 2) return 'Medium';
    return 'Low';
  }
}

// @route   POST /api/ai/generate-outfit
// @desc    Generate AI outfit recommendations
// @access  Private
router.post('/generate-outfit', aiRateLimit, asyncHandler(async (req, res) => {
  const { eventType, mood, season, wardrobeItems } = req.body;

  // Validate input
  if (!eventType || !mood) {
    return res.status(400).json({
      success: false,
      message: 'Event type and mood are required'
    });
  }

  // Get user's wardrobe items if not provided
  let items = wardrobeItems;
  if (!items) {
    items = await WardrobeItem.findByUserId(req.user.id);
  }

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No wardrobe items found. Please add some clothing items first.'
    });
  }

  // Get user preferences
  const user = await User.findById(req.user.id);
  
  const preferences = {
    eventType,
    mood,
    season: season || 'all-season'
  };

  // Generate recommendations
  const recommendations = await ServerAIOutfitRecommendationService.generateRecommendations(
    items, 
    preferences, 
    user
  );

  // Update user stats
  await user.updateStats('outfitsGenerated');

  res.json({
    success: true,
    data: {
      recommendations,
      preferences,
      totalItems: items.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// @route   POST /api/ai/save-outfit
// @desc    Save an AI-generated outfit
// @access  Private
router.post('/save-outfit', asyncHandler(async (req, res) => {
  const { 
    name, 
    items, 
    eventType, 
    mood, 
    aiScore, 
    confidenceLevel, 
    reasoning, 
    styleNotes 
  } = req.body;

  // Validate input
  if (!name || !items || !eventType || !mood) {
    return res.status(400).json({
      success: false,
      message: 'Name, items, event type, and mood are required'
    });
  }

  // Verify items belong to user
  const wardrobeItems = await WardrobeItem.find({
    _id: { $in: items },
    userId: req.user.id
  });

  if (wardrobeItems.length !== items.length) {
    return res.status(400).json({
      success: false,
      message: 'Some wardrobe items not found or do not belong to you'
    });
  }

  // Create outfit
  const outfit = new Outfit({
    userId: req.user.id,
    name,
    items: items.map(itemId => ({ itemId })),
    occasion: {
      eventType,
      mood
    },
    aiGenerated: {
      isAIGenerated: true,
      score: aiScore || 0,
      confidenceLevel: confidenceLevel || 'Medium',
      reasoning: reasoning || '',
      styleNotes: styleNotes || [],
      generatedAt: new Date()
    }
  });

  await outfit.save();

  // Update wardrobe items usage
  await Promise.all(
    wardrobeItems.map(item => item.addToOutfit())
  );

  // Update user stats
  const user = await User.findById(req.user.id);
  await user.updateStats('favoriteOutfits');

  res.status(201).json({
    success: true,
    data: outfit
  });
}));

// @route   GET /api/ai/wardrobe-analysis
// @desc    Analyze user's wardrobe and provide insights
// @access  Private
router.get('/wardrobe-analysis', asyncHandler(async (req, res) => {
  const wardrobeItems = await WardrobeItem.findByUserId(req.user.id);
  
  if (wardrobeItems.length === 0) {
    return res.json({
      success: true,
      data: {
        analysis: 'No wardrobe items to analyze',
        recommendations: ['Start by adding some clothing items to your wardrobe']
      }
    });
  }

  // Analyze wardrobe composition
  const categoryBreakdown = {};
  const colorBreakdown = {};
  const styleBreakdown = {};
  const seasonBreakdown = {};

  wardrobeItems.forEach(item => {
    // Category analysis
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    
    // Color analysis
    if (item.colors) {
      item.colors.forEach(color => {
        colorBreakdown[color.primary] = (colorBreakdown[color.primary] || 0) + 1;
      });
    }
    
    // Style analysis
    if (item.style) {
      styleBreakdown[item.style] = (styleBreakdown[item.style] || 0) + 1;
    }
    
    // Season analysis
    if (item.season) {
      item.season.forEach(season => {
        seasonBreakdown[season] = (seasonBreakdown[season] || 0) + 1;
      });
    }
  });

  // Generate recommendations
  const recommendations = [];
  
  // Check for missing essentials
  const essentials = ['Tops', 'Bottoms', 'Shoes'];
  essentials.forEach(category => {
    if (!categoryBreakdown[category] || categoryBreakdown[category] < 3) {
      recommendations.push(`Consider adding more ${category.toLowerCase()} for a complete wardrobe`);
    }
  });

  // Check for color variety
  const colorCount = Object.keys(colorBreakdown).length;
  if (colorCount < 3) {
    recommendations.push('Add more color variety to increase outfit possibilities');
  } else if (colorCount > 10) {
    recommendations.push('Focus on a cohesive color palette for better coordination');
  }

  // Check for style consistency
  const dominantStyle = Object.keys(styleBreakdown).reduce((a, b) => 
    styleBreakdown[a] > styleBreakdown[b] ? a : b, Object.keys(styleBreakdown)[0]
  );

  // Usage analysis
  const mostWornItems = wardrobeItems
    .sort((a, b) => b.usage.timesWorn - a.usage.timesWorn)
    .slice(0, 5);

  const leastWornItems = wardrobeItems
    .filter(item => item.usage.timesWorn === 0)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      totalItems: wardrobeItems.length,
      categoryBreakdown,
      colorBreakdown,
      styleBreakdown,
      seasonBreakdown,
      dominantStyle,
      mostWornItems: mostWornItems.map(item => ({
        id: item._id,
        name: item.name,
        timesWorn: item.usage.timesWorn
      })),
      leastWornItems: leastWornItems.map(item => ({
        id: item._id,
        name: item.name,
        category: item.category
      })),
      recommendations,
      wardrobeScore: Math.min(100, Math.round((wardrobeItems.length / 20) * 100)),
      analysis: `Your wardrobe has ${wardrobeItems.length} items with a focus on ${dominantStyle || 'mixed'} style.`
    }
  });
}));

// @route   POST /api/ai/style-feedback
// @desc    Submit feedback on AI recommendations to improve future suggestions
// @access  Private
router.post('/style-feedback', asyncHandler(async (req, res) => {
  const { outfitId, rating, feedback, improvements } = req.body;

  // Find and update outfit
  const outfit = await Outfit.findOne({
    _id: outfitId,
    userId: req.user.id
  });

  if (!outfit) {
    return res.status(404).json({
      success: false,
      message: 'Outfit not found'
    });
  }

  // Update feedback
  await outfit.updateFeedback({
    userRating: rating,
    improvements,
    ...feedback
  });

  res.json({
    success: true,
    message: 'Feedback submitted successfully',
    data: outfit.feedback
  });
}));

// @route   GET /api/ai/style-trends
// @desc    Get current style trends and recommendations
// @access  Private
router.get('/style-trends', asyncHandler(async (req, res) => {
  // This would typically connect to external fashion APIs
  // For now, return static trending data
  
  const currentSeason = getCurrentSeason();
  const trends = getTrendsByseason(currentSeason);

  res.json({
    success: true,
    data: {
      season: currentSeason,
      trends,
      colors: getTrendingColors(currentSeason),
      styles: getTrendingStyles(currentSeason),
      tips: getSeasonalTips(currentSeason)
    }
  });
}));

// Helper functions
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function getTrendsByseason(season) {
  const seasonTrends = {
    spring: ['pastels', 'florals', 'light layers', 'trench coats'],
    summer: ['bright colors', 'breathable fabrics', 'minimalist', 'sandals'],
    fall: ['earth tones', 'layering', 'boots', 'sweaters'],
    winter: ['dark colors', 'cozy textures', 'outerwear', 'accessories']
  };
  return seasonTrends[season] || [];
}

function getTrendingColors(season) {
  const seasonColors = {
    spring: ['sage green', 'lavender', 'soft pink', 'cream'],
    summer: ['coral', 'turquoise', 'yellow', 'white'],
    fall: ['burgundy', 'mustard', 'brown', 'olive'],
    winter: ['navy', 'black', 'gray', 'burgundy']
  };
  return seasonColors[season] || [];
}

function getTrendingStyles(season) {
  const seasonStyles = {
    spring: ['romantic', 'casual', 'bohemian'],
    summer: ['minimalist', 'casual', 'trendy'],
    fall: ['classic', 'edgy', 'layered'],
    winter: ['formal', 'cozy', 'structured']
  };
  return seasonStyles[season] || [];
}

function getSeasonalTips(season) {
  const seasonTips = {
    spring: ['Layer light pieces', 'Incorporate fresh colors', 'Add floral prints'],
    summer: ['Choose breathable fabrics', 'Embrace minimal styling', 'Protect from sun'],
    fall: ['Master the art of layering', 'Invest in quality outerwear', 'Add warm accessories'],
    winter: ['Focus on warmth', 'Add texture with knits', 'Don\'t forget accessories']
  };
  return seasonTips[season] || [];
}

module.exports = router;