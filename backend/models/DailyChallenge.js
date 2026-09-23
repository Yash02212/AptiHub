const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  topicName: { type: String, default: '' },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  numberOfQuestions: { type: Number, default: 5 },
  duration: { type: Number, default: 10 }, // minutes
  xpReward: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
