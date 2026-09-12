const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Create teacher
router.post('/create-teacher', authMiddleware, roleCheck(['academic_admin']), async (req, res) => {
  try {
    const { fullName, email, password, phone, subject, department, qualification, experience, salary } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const user = new User({
      fullName, email, password, role: 'teacher', phone,
      createdBy: req.userId
    });
    await user.save();
    
    const teacherId = `TCH${Date.now()}`;
    const teacher = new Teacher({
      user: user._id, teacherId, subject, department, qualification, experience, salary
    });
    await teacher.save();
    
    res.json({ success: true, message: 'Teacher created successfully', teacher: { ...teacher.toObject(), fullName, email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all teachers
router.get('/teachers', authMiddleware, roleCheck(['academic_admin']), async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('user', 'fullName email phone isActive');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete teacher
router.delete('/teachers/:id', authMiddleware, roleCheck(['academic_admin']), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (teacher) {
      await User.findByIdAndDelete(teacher.user);
      await Teacher.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create class
router.post('/classes', authMiddleware, roleCheck(['academic_admin']), async (req, res) => {
  try {
    const { className, grade, academicYear, teacherId } = req.body;
    const newClass = new Class({ className, grade, academicYear, teacher: teacherId });
    await newClass.save();
    
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, { $push: { classes: newClass._id } });
    }
    
    res.json({ success: true, message: 'Class created successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all classes
router.get('/classes', authMiddleware, roleCheck(['academic_admin']), async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'fullName');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete class
router.delete('/classes/:id', authMiddleware, roleCheck(['academic_admin']), async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;