const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  type: {
    type: String,
    enum: ['practice', 'mock', 'daily', 'placement', 'custom'],
    default: 'mock'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    default: 'mixed'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  numberOfQuestions: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  marksPerQuestion: {
    type: Number,
    default: 1
  },
  negativeMarking: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  attemptCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
