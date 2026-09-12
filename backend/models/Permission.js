const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requesterName: String,
  requesterRole: String,
  type: String,
  reason: String,
  fromDate: Date,
  toDate: Date,
  status: { type: String, default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  slipGeneratedCount: { type: Number, default: 0 },
  lastSlipGeneratedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Permission', permissionSchema);