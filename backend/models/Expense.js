const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  date: Date,
  description: String,
  reference: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);