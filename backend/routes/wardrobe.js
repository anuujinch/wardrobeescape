const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const WardrobeItem = require('../models/WardrobeItem');

const router = express.Router();

// @route   GET /api/wardrobe
// @desc    Get user's wardrobe items
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { category, season, style, search } = req.query;
  
  let filters = {};
  if (category) filters.category = category;
  if (season) filters.season = season;
  if (style) filters.style = style;
  
  let items;
  if (search) {
    items = await WardrobeItem.searchItems(req.user.id, search);
  } else {
    items = await WardrobeItem.findByUserId(req.user.id, filters);
  }
  
  res.json({
    success: true,
    data: items,
    count: items.length
  });
}));

// @route   POST /api/wardrobe
// @desc    Add new wardrobe item
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const itemData = { ...req.body, userId: req.user.id };
  const item = new WardrobeItem(itemData);
  await item.save();
  
  res.status(201).json({
    success: true,
    data: item,
    message: 'Wardrobe item added successfully'
  });
}));

// @route   GET /api/wardrobe/:id
// @desc    Get single wardrobe item
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await WardrobeItem.findOne({
    _id: req.params.id,
    userId: req.user.id
  });
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Wardrobe item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
}));

// @route   PUT /api/wardrobe/:id
// @desc    Update wardrobe item
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
  const item = await WardrobeItem.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Wardrobe item not found'
    });
  }
  
  res.json({
    success: true,
    data: item,
    message: 'Wardrobe item updated successfully'
  });
}));

// @route   DELETE /api/wardrobe/:id
// @desc    Delete wardrobe item (soft delete)
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const item = await WardrobeItem.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isActive: false },
    { new: true }
  );
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Wardrobe item not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Wardrobe item deleted successfully'
  });
}));

// @route   POST /api/wardrobe/:id/usage
// @desc    Update usage statistics for an item
// @access  Private
router.post('/:id/usage', asyncHandler(async (req, res) => {
  const { action } = req.body; // 'wear', 'outfit', 'favorite', 'unfavorite'
  
  const item = await WardrobeItem.findOne({
    _id: req.params.id,
    userId: req.user.id
  });
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Wardrobe item not found'
    });
  }
  
  switch (action) {
    case 'wear':
      await item.incrementUsage();
      break;
    case 'outfit':
      await item.addToOutfit();
      break;
    case 'favorite':
      await item.addFavorite();
      break;
    case 'unfavorite':
      await item.removeFavorite();
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
  }
  
  res.json({
    success: true,
    data: item,
    message: 'Usage updated successfully'
  });
}));

// @route   GET /api/wardrobe/stats
// @desc    Get wardrobe statistics
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const [
    totalItems,
    itemsByCategory,
    mostWorn,
    unused
  ] = await Promise.all([
    WardrobeItem.countDocuments({ userId, isActive: true }),
    WardrobeItem.aggregate([
      { $match: { userId: userId, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    WardrobeItem.findMostWorn(userId, 5),
    WardrobeItem.findUnused(userId, 30)
  ]);
  
  res.json({
    success: true,
    data: {
      totalItems,
      itemsByCategory,
      mostWorn,
      unused: unused.length
    }
  });
}));

module.exports = router;