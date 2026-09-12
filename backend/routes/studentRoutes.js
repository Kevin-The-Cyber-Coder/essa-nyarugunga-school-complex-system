const express = require('express');

const Grade = require('../models/Grade');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/student/grades/:studentId', authMiddleware, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;