const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');

// Get all published news (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;
    const query = { isPublished: true };
    
    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const news = await News.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single news by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    // Increment views
    news.views += 1;
    await news.save();
    
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create news (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update news (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete news (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;