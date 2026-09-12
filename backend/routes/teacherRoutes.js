const express = require('express');
const mongoose = require('mongoose');

const TeacherProfile = require('../models/TeacherProfile');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const LessonPlan = require('../models/LessonPlan');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { uploadAssignment, uploadLesson } = require('../config/upload');

const router = express.Router();

// ==================== DASHBOARD ====================
router.get('/teacher/dashboard', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ userId: req.userId });
    const classes = await Class.find({ teacherId: req.userId });
    const classIds = classes.map(c => c._id);
    const [totalStudents, pendingAssignments, recentGrades] = await Promise.all([
      Student.countDocuments({ classId: { $in: classIds } }),
      Assignment.countDocuments({ teacherId: req.userId, dueDate: { $gte: new Date() } }),
      Grade.find({ teacherId: req.userId }).sort({ createdAt: -1 }).limit(5)
    ]);
    res.json({ success: true, teacherProfile, classes, totalStudents, pendingAssignments, recentGrades });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== GRADES ====================
router.get('/teacher/grades', authMiddleware, async (req, res) => {
  try {
    const grades = await Grade.find({ teacherId: req.userId }).populate('studentId', 'fullName studentId');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/teacher/grades', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    const grade = await Grade.create({ ...req.body, teacherId: req.userId });
    res.json({ success: true, grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ATTENDANCE ====================
router.post('/teacher/attendance', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    const bulk = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, classId, date: new Date(date) },
        update: { $set: { status: r.status, teacherId: req.userId } },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(bulk);
    res.json({ success: true, message: 'Attendance saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/teacher/attendance/:classId', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { classId: req.params.classId };
    if (date) query.date = new Date(date);
    const attendance = await Attendance.find(query).populate('studentId', 'fullName studentId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/teacher/attendance', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ teacherId: req.userId }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.json([]);
  }
});

// ==================== ASSIGNMENTS ====================
router.get('/teacher/assignments', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    let query = {};
    if (req.userRole === 'teacher') {
      query.teacherId = req.userId;
    }
    const assignments = await Assignment.find(query).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/teacher/assignments', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), uploadAssignment.single('file'), async (req, res) => {
  try {
    const fileUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/assignments/${req.file.filename}` : null;

    const assignment = await Assignment.create({
      title: req.body.title,
      description: req.body.description || '',
      classId: req.body.classId,
      type: req.body.type || 'homework',
      dueDate: new Date(req.body.dueDate),
      totalPoints: parseInt(req.body.totalPoints) || 100,
      fileUrl,
      teacherId: req.userId,
      status: 'published'
    });

    res.json({ success: true, assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== LESSON PLANS ====================
router.get('/teacher/lesson-plans', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    let query = {};
    if (req.userRole === 'teacher') {
      query.teacherId = req.userId;
    }
    const lessonPlans = await LessonPlan.find(query).sort({ createdAt: -1 });
    res.json(lessonPlans);
  } catch (error) {
    res.json([]);
  }
});

router.post('/teacher/lesson-plans', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), uploadLesson.single('file'), async (req, res) => {
  try {
    const fileUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/lessons/${req.file.filename}` : null;

    const lessonPlan = await LessonPlan.create({
      title: req.body.title,
      topic: req.body.topic,
      objectives: req.body.objectives || '',
      materials: req.body.materials || '',
      fileUrl,
      shareWithStudents: req.body.shareWithStudents === 'true',
      teacherId: req.userId
    });

    res.json({ success: true, lessonPlan });
  } catch (error) {
    console.error('Create lesson plan error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== LEAVES ====================
router.get('/teacher/leaves', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.json([]);
  }
});

router.post('/teacher/leaves', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;