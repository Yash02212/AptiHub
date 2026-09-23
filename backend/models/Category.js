const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📊'
  },
  color: {
    type: String,
    default: '#4F46E5'
  },
  questionCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
