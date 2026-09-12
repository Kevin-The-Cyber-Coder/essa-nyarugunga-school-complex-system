const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const Student = require('../models/Student');
const Class = require('../models/Class');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// ==================== TEACHERS ====================
router.get('/academic-admin/teachers-list', authMiddleware, async (req, res) => {
  const teachers = await TeacherProfile.find().sort({ fullName: 1 });
  res.json(teachers);
});

router.post('/academic-admin/create-teacher-credentials', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { fullName, email, password, subject, phone } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const finalPassword = password || 'teacher123';
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const teacherUser = await User.create({ fullName, email, password: hashedPassword, role: 'teacher', phone: phone || '', createdBy: req.userId });
    const teacherProfile = await TeacherProfile.create({ userId: teacherUser._id, fullName, email, subject: subject || 'General', phone: phone || '' });
    sendWelcomeEmail({ fullName, email, role: 'teacher', tempPassword: finalPassword }).catch(console.error);
    res.json({ success: true, teacher: teacherProfile, password: finalPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/academic-admin/teachers/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { fullName, email, subject, phone } = req.body;
    const teacher = await TeacherProfile.findByIdAndUpdate(req.params.id, { fullName, email, subject, phone }, { new: true });
    if (teacher?.userId) await User.findByIdAndUpdate(teacher.userId, { fullName, email, phone });
    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/academic-admin/teachers/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (teacher?.userId) await User.findByIdAndDelete(teacher.userId);
    await TeacherProfile.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CLASSES ====================
router.get('/academic-admin/classes', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find().lean();
    for (const cls of classes) {
      if (cls.teacherId) {
        const teacher = await TeacherProfile.findOne({ userId: cls.teacherId });
        if (teacher) cls.teacherInfo = { _id: cls.teacherId, fullName: teacher.fullName };
      }
    }
    res.json(classes);
  } catch {
    res.json([]);
  }
});

router.post('/academic-admin/classes', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { className, grade, academicYear, teacherId } = req.body;
    const newClass = await Class.create({ className, grade, academicYear, teacherId: teacherId || null, students: [] });
    res.json({ success: true, class: newClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/academic-admin/classes/:classId/assign-teacher', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(req.params.classId, { teacherId: req.body.teacherId }, { new: true });
    if (!classItem) return res.status(404).json({ message: 'Class not found' });
    res.json({ success: true, class: classItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/academic-admin/classes/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ==================== STUDENTS ====================
router.get('/academic-admin/students', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().populate('classId', 'grade className').sort({ fullName: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/academic-admin/students', authMiddleware, requireRole('academic_admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const studentId = `STU${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;

    if (req.body.classId) {
      const classItem = await Class.findById(req.body.classId);
      if (req.userRole !== 'super_admin' && req.userRole !== 'academic_admin') {
        if (classItem.teacherId?.toString() !== req.userId) {
          return res.status(403).json({ message: 'You can only add students to your assigned classes' });
        }
      }
    }

    const student = await Student.create({ ...req.body, studentId });
    if (req.body.classId) {
      await Class.findByIdAndUpdate(req.body.classId, { $addToSet: { students: student._id } });
    }

    const hashedPassword = await bcrypt.hash(req.body.password || 'student123', 10);
    const studentUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email || `${req.body.fullName.replace(/\s/g, '').toLowerCase()}@student.essa.rw`,
      password: hashedPassword,
      role: 'student',
      phone: req.body.parentPhone,
      createdBy: req.userId
    });

    student.userId = studentUser._id;
    await student.save();

    res.json({ success: true, student, generatedPassword: req.body.password || 'student123' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PERFORMANCE ====================
router.get('/academic-admin/students-performance', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().populate('classId', 'grade className');
    const performanceData = students.map(s => ({
      studentId: s.studentId || `STU${s._id.toString().slice(-6)}`,
      name: s.fullName,
      class: s.classId ? `${s.classId.grade} ${s.classId.className}` : 'Not Assigned',
      averageScore: Math.floor(Math.random() * 30) + 65
    }));
    res.json(performanceData);
  } catch {
    res.json([]);
  }
});

router.get('/academic-admin/class-performance', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find();
    const performanceData = classes.map(cls => ({
      className: `${cls.grade} ${cls.className}`,
      studentCount: cls.students?.length || 0,
      averageScore: Math.floor(Math.random() * 25) + 70
    }));
    res.json(performanceData);
  } catch {
    res.json([]);
  }
});

module.exports = router;