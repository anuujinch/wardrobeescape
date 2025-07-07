const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const WardrobeItem = require('../models/WardrobeItem');

const router = express.Router();

// @route   GET /api/wardrobe
// @desc    Get user's wardrobe items
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const items = await WardrobeItem.findByUserId(req.user.id);
  
  res.json({
    success: true,
    data: items
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
    data: item
  });
}));

module.exports = router;