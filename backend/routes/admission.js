const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const { sendAdmissionEmail } = require('../utils/emailService');
const auth = require('../middleware/auth');

// Submit admission application (public)
router.post('/', async (req, res) => {
  try {
    const admissionData = req.body;
    
    // Save to database
    const admission = new Admission(admissionData);
    await admission.save();
    
    // Send email to admin
    await sendAdmissionEmail(admissionData);
    
    res.json({ 
      success: true, 
      message: 'Your application has been submitted successfully. You will receive a confirmation email shortly.',
      applicationId: admission._id
    });
  } catch (error) {
    console.error('Admission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application. Please try again later.' 
    });
  }
});

// Get all applications (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Admission.find(query)
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Admission.countDocuments(query);
    
    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update application status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Admission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;