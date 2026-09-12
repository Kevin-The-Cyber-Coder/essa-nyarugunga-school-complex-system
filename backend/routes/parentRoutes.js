const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Get parent's children
router.get('/children', authMiddleware, roleCheck(['parent']), async (req, res) => {
  try {
    const students = await Student.find({ parent: req.userId }).populate('user', 'fullName email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get child's grades
router.get('/children/:id/grades', authMiddleware, roleCheck(['parent']), async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.id }).sort({ createdAt: -1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get child's attendance
router.get('/children/:id/attendance', authMiddleware, roleCheck(['parent']), async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get child's fees
router.get('/children/:id/fees', authMiddleware, roleCheck(['parent']), async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.id });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Parent routes working' });
});

module.exports = router;