const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: String,
    required: true,
    unique: true
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  occupation: {
    type: String,
    default: ''
  },
  relationship: {
    type: String,
    enum: ['Father', 'Mother', 'Guardian'],
    default: 'Guardian'
  }
});

module.exports = mongoose.model('Parent', parentSchema);