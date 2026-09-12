const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  amount: Number,
  feeType: String,
  paymentDate: Date,
  receiptNo: String,
  status: { type: String, default: 'completed' }
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);