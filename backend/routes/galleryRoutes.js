const express = require('express');

const Gallery = require('../models/Gallery');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { uploadGallery } = require('../config/upload');

const router = express.Router();

router.get('/gallery/public', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    const gallery = await Gallery.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, data: [] });
  }
});

router.get('/academic-admin/gallery', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const gallery = await Gallery.find().sort({ date: -1 });
  res.json(gallery);
});

router.post('/academic-admin/gallery', authMiddleware, requireRole('academic_admin', 'super_admin'), uploadGallery.single('image'), async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/gallery/${req.file.filename}` : null;
    if (!imageUrl) return res.status(400).json({ message: 'Image is required' });
    const galleryItem = await Gallery.create({ title, image: imageUrl, category: category || 'events', description: description || '', isPublished: true });
    res.json({ success: true, gallery: galleryItem, imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/academic-admin/gallery/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;