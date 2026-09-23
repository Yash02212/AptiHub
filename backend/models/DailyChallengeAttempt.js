const mongoose = require('mongoose');

const dailyChallengeAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyChallenge',
    required: true
  },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: false }
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  xpEarned: { type: Number, default: 0 }
}, { timestamps: true });

dailyChallengeAttemptSchema.index({ user: 1, challenge: 1 }, { unique: true });

module.exports = mongoose.model('DailyChallengeAttempt', dailyChallengeAttemptSchema);
