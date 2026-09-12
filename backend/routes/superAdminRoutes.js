const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Create sub-admin (Academic, Discipline, Accounts Admin)
router.post('/create-admin', authMiddleware, roleCheck(['super_admin']), async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const user = new User({
      fullName, email, password, role, phone,
      createdBy: req.userId,
      isActive: true
    });
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: `${role} created successfully`, 
      user: { _id: user._id, fullName, email, role } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all sub-admins
router.get('/admins', authMiddleware, roleCheck(['super_admin']), async (req, res) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['academic_admin', 'discipline_admin', 'accounts_admin'] } 
    }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete admin
router.delete('/admins/:id', authMiddleware, roleCheck(['super_admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create announcement
router.post('/announcements', authMiddleware, roleCheck(['super_admin']), async (req, res) => {
  try {
    const { title, content, audience, priority } = req.body;
    const announcement = new Announcement({
      title, content, audience, priority,
      createdBy: req.userId
    });
    await announcement.save();
    res.json({ success: true, message: 'Announcement published', announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all announcements
router.get('/announcements', authMiddleware, async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete announcement
router.delete('/announcements/:id', authMiddleware, roleCheck(['super_admin']), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;