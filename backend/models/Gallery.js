const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'sports', 'cultural', 'events']
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  imagePublicId: String,
  photographer: {
    type: String,
    default: 'School Media Team'
  },
  date: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);