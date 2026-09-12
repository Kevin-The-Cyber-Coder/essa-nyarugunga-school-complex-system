const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// Get all published gallery items (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const query = { isPublished: true };
    
    if (category && category !== 'all') query.category = category;
    
    const items = await Gallery.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single gallery item (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    item.views += 1;
    await item.save();
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create gallery item (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const item = new Gallery(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update gallery item (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete gallery item (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (item) {
      item.downloads += 1;
      await item.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;