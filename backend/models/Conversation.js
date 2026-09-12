const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String,
    lastReadAt: Date
  }],
  lastMessage: String,
  lastMessageAt: { type: Date, default: Date.now },
  subject: String,
  messageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Conversation', conversationSchema);