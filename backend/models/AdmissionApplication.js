const mongoose = require('mongoose');

const admissionApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, default: 'Rwandan' },
  nationalId: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  level: { type: String, required: true },
  previousSchool: { type: String, required: true },
  lastAverage: { type: Number, required: true },
  achievements: { type: String, default: '' },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentEmail: { type: String, default: '' },
  parentOccupation: { type: String, default: '' },
  applyScholarship: { type: Boolean, default: false },
  reportCardUrl: { type: String, default: '' },
  birthCertUrl: { type: String, default: '' },
  studentPhotoUrl: { type: String, default: '' },
  applicationNumber: { type: String, unique: true },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String, default: '' },
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

admissionApplicationSchema.pre('save', async function (next) {
  if (!this.applicationNumber) {
    const count = await mongoose.model('AdmissionApplication').countDocuments();
    this.applicationNumber = `APP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('AdmissionApplication', admissionApplicationSchema);