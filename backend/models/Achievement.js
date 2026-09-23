const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  type: {
    type: String,
    enum: ['tests', 'streak', 'accuracy', 'speed', 'questions', 'daily', 'special'],
    required: true
  },
  criteria: {
    field: String,
    operator: { type: String, enum: ['gte', 'lte', 'eq'] },
    value: Number
  },
  xpReward: { type: Number, default: 50 }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
