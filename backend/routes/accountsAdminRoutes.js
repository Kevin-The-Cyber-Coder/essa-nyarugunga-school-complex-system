const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Fee = require('../models/Fee');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Get teacher salaries
router.get('/salaries', authMiddleware, roleCheck(['accounts_admin', 'super_admin']), async (req, res) => {
  try {
    const salaries = await Salary.find().populate('teacherId');
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve salary
router.put('/salaries/:salaryId/approve', authMiddleware, roleCheck(['accounts_admin', 'super_admin']), async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.salaryId);
    salary.status = 'approved';
    salary.approvedBy = req.userId;
    await salary.save();
    res.json({ success: true, message: 'Salary approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all fees
router.get('/fees', authMiddleware, roleCheck(['accounts_admin', 'super_admin']), async (req, res) => {
  try {
    const fees = await Fee.find().populate('studentId');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign fees to student
router.post('/fees/assign', authMiddleware, roleCheck(['accounts_admin', 'super_admin']), async (req, res) => {
  try {
    const { studentId, term, year, amount, dueDate } = req.body;
    const fee = new Fee({
      studentId, term, year, amount, balance: amount, dueDate
    });
    await fee.save();
    res.json({ success: true, message: 'Fee assigned', fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Accounts admin routes working' });
});

module.exports = router;