const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  topicPerformance: [{
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    topicName: String,
    categoryName: String,
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    lastAttempted: Date
  }],
  categoryPerformance: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    categoryName: String,
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }
  }],
  difficultyPerformance: {
    easy: { attempted: { type: Number, default: 0 }, correct: { type: Number, default: 0 } },
    medium: { attempted: { type: Number, default: 0 }, correct: { type: Number, default: 0 } },
    hard: { attempted: { type: Number, default: 0 }, correct: { type: Number, default: 0 } }
  },
  scoreHistory: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    testName: String,
    score: Number,
    percentage: Number,
    accuracy: Number,
    date: { type: Date, default: Date.now }
  }],
  dailyActivity: [{
    date: { type: Date },
    questionsSolved: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 }
  }],
  weakTopics: [{ type: String }],
  strongTopics: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
