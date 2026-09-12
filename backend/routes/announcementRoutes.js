const express = require('express');

const Announcement = require('../models/Announcement');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

const router = express.Router();

router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    const formatted = announcements.map(ann => ({
      ...ann.toObject(),
      audience: Array.isArray(ann.audience) ? ann.audience[0] : (ann.audience || 'all')
    }));
    res.json(formatted);
  } catch (error) {
    console.error('GET /api/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/announcements', authMiddleware, async (req, res) => {
  try {
    const allowedRoles = ['super_admin', 'academic_admin', 'discipline_admin', 'accounts_admin'];
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to post announcements.' });
    }

    let audience = req.body.audience;
    if (typeof audience === 'string') {
      audience = audience === 'all' ? ['all'] : [audience];
    }
    if (!audience || (Array.isArray(audience) && audience.length === 0)) {
      audience = ['all'];
    }

    const announcement = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      audience: audience,
      priority: req.body.priority || 'normal',
      createdBy: req.userId,
      isActive: true
    });

    res.json({
      success: true,
      announcement: {
        ...announcement.toObject(),
        audience: announcement.audience[0]
      }
    });
  } catch (error) {
    console.error('POST /api/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/super-admin/announcements', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    const formatted = announcements.map(ann => ({
      ...ann.toObject(),
      audience: Array.isArray(ann.audience) ? ann.audience[0] : (ann.audience || 'all')
    }));
    res.json(formatted);
  } catch (error) {
    console.error('GET /api/super-admin/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/super-admin/announcements', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    let audience = req.body.audience;
    if (typeof audience === 'string') {
      audience = audience === 'all' ? ['all'] : [audience];
    }
    if (!audience || (Array.isArray(audience) && audience.length === 0)) {
      audience = ['all'];
    }

    const announcement = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      audience: audience,
      priority: req.body.priority || 'normal',
      createdBy: req.userId,
      isActive: true
    });

    res.json({
      success: true,
      announcement: {
        ...announcement.toObject(),
        audience: announcement.audience[0]
      }
    });
  } catch (error) {
    console.error('POST /api/super-admin/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/super-admin/announcements/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({
      success: true,
      announcement: {
        ...announcement.toObject(),
        audience: Array.isArray(announcement.audience) ? announcement.audience[0] : (announcement.audience || 'all')
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/super-admin/announcements/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;