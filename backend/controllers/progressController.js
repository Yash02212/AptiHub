const Progress = require('../models/Progress');
const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');

// @desc    Get user progress
// @route   GET /api/progress
exports.getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id });
    }

    const user = await User.findById(req.user._id);

    // Calculate additional stats
    const recentAttempts = await TestAttempt.find({ user: req.user._id, status: 'completed' })
      .sort({ submittedAt: -1 })
      .limit(10);

    const avgScore = recentAttempts.length > 0
      ? Math.round(recentAttempts.reduce((sum, a) => sum + a.percentage, 0) / recentAttempts.length)
      : 0;

    const avgAccuracy = recentAttempts.length > 0
      ? Math.round(recentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / recentAttempts.length)
      : 0;

    res.json({
      success: true,
      data: {
        progress,
        stats: {
          totalTests: user.totalTestsAttempted,
          totalQuestions: user.totalQuestionsSolved,
          xp: user.xp,
          streak: user.streak,
          avgScore,
          avgAccuracy
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get personalized recommendations
// @route   GET /api/progress/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      return res.json({ success: true, data: { weakTopics: [], recommendations: [] } });
    }

    // Get weak topics (accuracy < 50% with at least 3 attempts)
    const weakTopics = progress.topicPerformance
      .filter(t => t.totalAttempted >= 3 && t.accuracy < 50)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Get topics not yet attempted
    const attemptedTopicIds = progress.topicPerformance.map(t => t.topic?.toString());

    res.json({
      success: true,
      data: {
        weakTopics,
        strongTopics: progress.strongTopics,
        categoryPerformance: progress.categoryPerformance,
        difficultyPerformance: progress.difficultyPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
