const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  options: [{
    label: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    enum: ['A', 'B', 'C', 'D']
  },
  explanation: {
    type: String,
    default: ''
  },
  marks: {
    type: Number,
    default: 1
  },
  negativeMark: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timesAttempted: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

questionSchema.index({ category: 1, topic: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
