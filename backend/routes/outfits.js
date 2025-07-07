const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const Outfit = require('../models/Outfit');

const router = express.Router();

// @route   GET /api/outfits
// @desc    Get user's saved outfits
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const outfits = await Outfit.findByUserId(req.user.id);
  
  res.json({
    success: true,
    data: outfits
  });
}));

// @route   POST /api/outfits
// @desc    Save new outfit
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const outfitData = { ...req.body, userId: req.user.id };
  const outfit = new Outfit(outfitData);
  await outfit.save();
  
  res.status(201).json({
    success: true,
    data: outfit
  });
}));

module.exports = router;