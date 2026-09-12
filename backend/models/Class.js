const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: String,
  grade: { type: String, enum: ['S1', 'S2', 'S3', 'S4 or L3', 'S5 or l4', 'S6 or l5'] },
  academicYear: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);