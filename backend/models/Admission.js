const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Student Information
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, default: 'Rwandan' },
  nationalId: String,
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  level: { type: String, required: true },
  previousSchool: { type: String, required: true },
  lastAverage: { type: Number, required: true },
  achievements: String,
  
  // Parent Information
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentEmail: String,
  parentOccupation: String,
  
  // Documents
  reportCardUrl: String,
  birthCertUrl: String,
  photoUrl: String,
  
  // Scholarship
  applyScholarship: { type: Boolean, default: false },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  applicationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admission', admissionSchema);