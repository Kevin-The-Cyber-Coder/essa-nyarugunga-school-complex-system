const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  objectives: String,
  materials: String,
  fileUrl: String,
  shareWithStudents: { type: Boolean, default: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);