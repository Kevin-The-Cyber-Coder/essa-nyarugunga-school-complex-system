const express = require('express');

const AdmissionApplication = require('../models/AdmissionApplication');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { sendAdmissionConfirmationEmail } = require('../utils/emailService');

const router = express.Router();

router.post('/admissions/submit', async (req, res) => {
  try {
    const data = req.body;
    const application = await AdmissionApplication.create({
      fullName: data.fullName, dateOfBirth: new Date(data.dateOfBirth),
      nationality: data.nationality || 'Rwandan', nationalId: data.nationalId || '',
      email: data.email, phone: data.phone, address: data.address,
      level: data.level, previousSchool: data.previousSchool,
      lastAverage: parseFloat(data.lastAverage), achievements: data.achievements || '',
      parentName: data.parentName, parentPhone: data.parentPhone,
      parentEmail: data.parentEmail || '', parentOccupation: data.parentOccupation || '',
      applyScholarship: data.applyScholarship || false
    });
    sendAdmissionConfirmationEmail(application).catch(console.error);
    res.json({ success: true, message: 'Application submitted!', applicationNumber: application.applicationNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/academic-admin/applications', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const applications = await AdmissionApplication.find().sort({ createdAt: -1 });
  res.json(applications);
});

router.put('/academic-admin/applications/:id/status', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const application = await AdmissionApplication.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, reviewNotes: req.body.reviewNotes || '', reviewedAt: new Date(), reviewedBy: req.userId },
    { new: true }
  );
  res.json({ success: true, application });
});

module.exports = router;