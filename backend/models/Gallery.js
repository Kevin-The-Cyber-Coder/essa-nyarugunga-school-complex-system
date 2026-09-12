const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, default: 'events' },
  description: String,
  photographer: { type: String, default: 'School Media Team' },
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
});

module.exports = mongoose.model('Gallery', gallerySchema);