const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AdmissionApplication = require('../models/AdmissionApplication');
const Discipline = require('../models/Discipline');
const Permission = require('../models/Permission');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

router.get('/super-admin/admins', authMiddleware, requireRole('super_admin'), async (req, res) => {
  const admins = await User.find({ role: { $in: ['academic_admin', 'discipline_admin', 'accounts_admin'] } }).select('-password');
  res.json(admins);
});

router.post('/super-admin/create-admin', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
    const newAdmin = await User.create({ fullName, email, password: hashedPassword, role, phone: phone || '', createdBy: req.userId });
    sendWelcomeEmail({ fullName, email, role, tempPassword: password || 'admin123' }).catch(console.error);
    res.json({ success: true, user: { _id: newAdmin._id, fullName, email, role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/super-admin/admins/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { fullName, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { fullName, phone, isActive }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/super-admin/admins/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/super-admin/stats', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalClasses, pendingApplications, pendingDiscipline, pendingPermissions, totalIncome, totalExpenses] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      TeacherProfile.countDocuments(),
      Class.countDocuments(),
      AdmissionApplication.countDocuments({ status: 'pending' }),
      Discipline.countDocuments({ status: 'pending' }),
      Permission.countDocuments({ status: 'pending' }),
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    res.json({
      success: true,
      totalStudents, totalTeachers, totalClasses, pendingApplications,
      pendingDiscipline, pendingPermissions,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/super-admin/users', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/super-admin/users/:id/toggle-active', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;