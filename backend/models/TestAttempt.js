const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: false },
    isSkipped: { type: Boolean, default: true },
    markedForReview: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 } // seconds
  }],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  skippedQuestions: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // total seconds
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null }
}, { timestamps: true });

testAttemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
