const express = require('express');

const FeeStructure = require('../models/FeeStructure');
const FeePayment = require('../models/FeePayment');
const Salary = require('../models/Salary');
const Budget = require('../models/Budget');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

const router = express.Router();

// ==================== FEES ====================
router.get('/accounts/fee-structures', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const feeStructures = await FeeStructure.find().populate('classId', 'grade className').sort({ createdAt: -1 });
  res.json(feeStructures);
});

router.post('/accounts/fee-structures', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const feeStructure = await FeeStructure.create(req.body);
    res.json({ success: true, feeStructure });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/accounts/fee-structures/:id', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  await FeeStructure.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/accounts/payments', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const payments = await FeePayment.find().populate('studentId', 'fullName studentId').sort({ paymentDate: -1 });
  res.json(payments);
});

router.post('/accounts/payments', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const count = await FeePayment.countDocuments();
    const receiptNo = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const payment = await FeePayment.create({ ...req.body, receiptNo, paymentDate: new Date() });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SALARIES ====================
router.get('/accounts/salaries', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const salaries = await Salary.find().sort({ createdAt: -1 });
  res.json(salaries);
});

router.post('/accounts/salaries', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const salary = await Salary.create(req.body);
    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/accounts/salaries/:id/approve', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.userId, approvedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== BUDGET / INCOME / EXPENSES ====================
router.get('/accounts/budget', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  let budget = await Budget.findOne().sort({ updatedAt: -1 });
  if (!budget) budget = { total: 0 };
  res.json(budget);
});

router.put('/accounts/budget', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    let budget = await Budget.findOne();
    if (budget) {
      budget.total = req.body.total; budget.updatedBy = req.userId; budget.updatedAt = new Date();
      await budget.save();
    } else {
      budget = await Budget.create({ total: req.body.total, updatedBy: req.userId });
    }
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accounts/income', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const income = await Income.find().sort({ date: -1 });
  res.json(income);
});

router.post('/accounts/income', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const income = await Income.create({ ...req.body, recordedBy: req.userId, date: req.body.date || new Date() });
    res.json({ success: true, income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accounts/expenses', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1 });
  res.json(expenses);
});

router.post('/accounts/expenses', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, recordedBy: req.userId, date: req.body.date || new Date() });
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accounts/financial-summary', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const [incomeAgg, expenseAgg, pendingSalaries, completedPayments] = await Promise.all([
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Salary.countDocuments({ status: 'pending' }),
      FeePayment.countDocuments({ status: 'completed' })
    ]);
    const totalIncome   = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    res.json({ success: true, totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, pendingSalaries, completedPayments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;