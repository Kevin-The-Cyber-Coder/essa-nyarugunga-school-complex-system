const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Fee = require('../models/Fee');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Get student dashboard data
router.get('/dashboard', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId }).populate('user', 'fullName email');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const grades = await Grade.find({ studentId: student._id }).sort({ createdAt: -1 });
    const attendance = await Attendance.find({ studentId: student._id }).sort({ date: -1 });
    const assignments = await Assignment.find({ classId: student.classId }).sort({ dueDate: 1 });
    const fees = await Fee.find({ studentId: student._id });
    
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(s => s.studentId?.toString() === student._id.toString());
      return { ...assignment.toObject(), status: submission ? (submission.score ? 'graded' : 'submitted') : 'pending', score: submission?.score };
    });
    
    res.json({
      student: { name: student.user.fullName, studentId: student.studentId, classId: student.classId },
      grades, attendance, assignments: assignmentsWithStatus, fees,
      totalAssignments: assignments.length,
      completedAssignments: assignmentsWithStatus.filter(a => a.status !== 'pending').length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit assignment
router.post('/assignments/:id/submit', authMiddleware, roleCheck(['student']), async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const student = await Student.findOne({ user: req.userId });
    const assignment = await Assignment.findById(req.params.id);
    
    const submission = {
      studentId: student._id,
      submittedAt: new Date(),
      content, fileUrl,
      status: 'submitted'
    };
    
    assignment.submissions.push(submission);
    await assignment.save();
    res.json({ success: true, message: 'Assignment submitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Student routes working' });
});

module.exports = router;