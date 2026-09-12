const express = require('express');

const News = require('../models/News');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { uploadNews } = require('../config/upload');
const { sendNewsNotificationEmail } = require('../utils/emailService');

const router = express.Router();

router.get('/news/public', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    const news = await News.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, data: [] });
  }
});

router.get('/news/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/academic-admin/news', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const news = await News.find().sort({ date: -1 });
  res.json(news);
});

router.post('/academic-admin/news', authMiddleware, requireRole('academic_admin', 'super_admin'), uploadNews.single('image'), async (req, res) => {
  try {
    const { title, summary, content, category, tags } = req.body;
    const currentUser = await User.findById(req.userId);
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/news/${req.file.filename}` : null;
    const news = await News.create({
      title, summary, content: content || summary,
      image: imageUrl, category: category || 'news',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      author: currentUser?.fullName || 'Academic Admin',
      date: new Date(), isPublished: true
    });
    sendNewsNotificationEmail(news).catch(console.error);
    res.json({ success: true, news, imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/academic-admin/news/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/academic-admin/news/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;