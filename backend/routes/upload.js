const express = require('express');
const multer = require('multer');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/upload/image
// @desc    Upload image file
// @access  Private
router.post('/image', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  // In production, upload to cloud storage (Firebase Storage, AWS S3, etc.)
  // For now, return a mock URL
  const imageUrl = `https://storage.example.com/images/${Date.now()}-${req.file.originalname}`;

  res.json({
    success: true,
    data: {
      url: imageUrl,
      filename: req.file.originalname,
      size: req.file.size
    }
  });
}));

module.exports = router;