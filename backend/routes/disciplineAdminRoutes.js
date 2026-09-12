const express = require('express');
const router = express.Router();
const Discipline = require('../models/Discipline');
const Permission = require('../models/Permission');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Get all discipline cases
router.get('/cases', authMiddleware, roleCheck(['discipline_admin', 'super_admin']), async (req, res) => {
  try {
    const cases = await Discipline.find().populate('studentId').populate('reportedBy', 'fullName').sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Review and take action on case
router.put('/cases/:caseId/review', authMiddleware, roleCheck(['discipline_admin', 'super_admin']), async (req, res) => {
  try {
    const { action, actionDetails, status } = req.body;
    const disciplineCase = await Discipline.findById(req.params.caseId);
    
    disciplineCase.action = action;
    disciplineCase.actionDetails = actionDetails;
    disciplineCase.status = status;
    disciplineCase.reviewedBy = req.userId;
    disciplineCase.reviewedAt = new Date();
    await disciplineCase.save();
    
    res.json({ success: true, message: `Case ${status}`, disciplineCase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all permission requests
router.get('/permissions', authMiddleware, roleCheck(['discipline_admin', 'super_admin']), async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ createdAt: -1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or reject permission
router.put('/permissions/:permissionId', authMiddleware, roleCheck(['discipline_admin', 'super_admin']), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const permission = await Permission.findById(req.params.permissionId);
    
    permission.status = status;
    permission.reviewedBy = req.userId;
    permission.reviewedAt = new Date();
    if (rejectionReason) permission.rejectionReason = rejectionReason;
    await permission.save();
    
    res.json({ success: true, message: `Permission ${status}`, permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Discipline admin routes working' });
});

module.exports = router;