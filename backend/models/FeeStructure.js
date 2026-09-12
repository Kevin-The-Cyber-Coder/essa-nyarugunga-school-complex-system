const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  feeType: String,
  amount: Number,
  dueDate: Date,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);