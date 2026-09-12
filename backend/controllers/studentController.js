const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private/Student
const getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    
    // Get grades
    const grades = await Grade.find({ student: student._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate average
    const avgScore = grades.reduce((acc, g) => acc + g.score, 0) / (grades.length || 1);
    
    // Get recent attendance
    const attendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(10);
    
    // Calculate attendance rate
    const totalDays = await Attendance.countDocuments({ student: student._id });
    const presentDays = await Attendance.countDocuments({ 
      student: student._id, 
      status: 'Present' 
    });
    const attendanceRate = totalDays ? (presentDays / totalDays * 100).toFixed(1) : 0;
    
    // Get pending assignments
    const assignments = await Assignment.find({ 
      class: student.class,
      dueDate: { $gt: new Date() }
    }).populate('teacher', 'fullName');
    
    res.json({
      student,
      grades,
      averageScore: avgScore.toFixed(1),
      attendance,
      attendanceRate,
      pendingAssignments: assignments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student grades
// @route   GET /api/student/grades
// @access  Private/Student
const getGrades = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const grades = await Grade.find({ student: student._id })
      .sort({ year: -1, term: -1 });
    
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student attendance
// @route   GET /api/student/attendance
// @access  Private/Student
const getAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const attendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student assignments
// @route   GET /api/student/assignments
// @access  Private/Student
const getAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const assignments = await Assignment.find({ class: student.class })
      .populate('teacher', 'fullName')
      .sort({ dueDate: 1 });
    
    // Add submission status for this student
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        s => s.student.toString() === student._id.toString()
      );
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : 'pending',
        submissionScore: submission ? submission.score : null
      };
    });
    
    res.json(assignmentsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, getGrades, getAttendance, getAssignments };