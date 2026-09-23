const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questionCount: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: '📝'
  }
}, { timestamps: true });

topicSchema.index({ category: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
