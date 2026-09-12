const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  source: String,
  amount: Number,
  date: Date,
  description: String,
  reference: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Income', incomeSchema);