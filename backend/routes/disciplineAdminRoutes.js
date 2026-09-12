const express = require('express');

const Discipline = require('../models/Discipline');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

const router = express.Router();

router.get('/discipline-admin/cases', authMiddleware, requireRole('discipline_admin', 'super_admin'), async (req, res) => {
  try {
    const cases = await Discipline.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/discipline-admin/cases', authMiddleware, async (req, res) => {
  try {
    const disciplineCase = await Discipline.create({ ...req.body, reportedBy: req.userId, reporterName: req.userName });
    res.json({ success: true, case: disciplineCase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/discipline-admin/cases/:id', authMiddleware, requireRole('discipline_admin', 'super_admin'), async (req, res) => {
  try {
    const disciplineCase = await Discipline.findByIdAndUpdate(
      req.params.id,
      { ...req.body, reviewedBy: req.userId, reviewedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, case: disciplineCase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/discipline-admin/stats', authMiddleware, requireRole('discipline_admin', 'super_admin'), async (req, res) => {
  try {
    const [pending, resolved, total] = await Promise.all([
      Discipline.countDocuments({ status: 'pending' }),
      Discipline.countDocuments({ status: 'resolved' }),
      Discipline.countDocuments()
    ]);
    res.json({ success: true, pending, resolved, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;