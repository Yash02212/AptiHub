const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const Category = require('../models/Category');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalQuestions = await Question.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalAttempts = await TestAttempt.countDocuments({ status: 'completed' });

    const avgScoreResult = await TestAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
    ]);

    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    // Recent attempts
    const recentAttempts = await TestAttempt.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('test', 'name')
      .sort({ submittedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalQuestions,
        totalTests,
        totalAttempts,
        avgScore,
        recentAttempts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students (Admin)
// @route   GET /api/admin/students
exports.getStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/unblock student
// @route   PUT /api/admin/students/:id/block
exports.toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Student not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, data: user, message: user.isBlocked ? 'Student blocked' : 'Student unblocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await TestAttempt.deleteMany({ user: req.params.id });
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalAttempts = await TestAttempt.countDocuments({ status: 'completed' });

    const scoreStats = await TestAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
        _id: null,
        avgScore: { $avg: '$percentage' },
        highestScore: { $max: '$percentage' },
        lowestScore: { $min: '$percentage' },
        avgAccuracy: { $avg: '$accuracy' }
      }}
    ]);

    // Most attempted topics
    const topicStats = await TestAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$answers' },
      { $lookup: { from: 'questions', localField: 'answers.question', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      { $lookup: { from: 'topics', localField: 'q.topic', foreignField: '_id', as: 'topic' } },
      { $unwind: '$topic' },
      { $group: { _id: '$topic.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Monthly registration trend
    const registrationTrend = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        totalAttempts,
        scoreStats: scoreStats[0] || {},
        topicStats,
        registrationTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export results
// @route   GET /api/admin/export
exports.exportResults = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ status: 'completed' })
      .populate('user', 'name email college')
      .populate('test', 'name')
      .sort({ submittedAt: -1 });

    const csvRows = ['Student,Email,College,Test,Score,Percentage,Accuracy,Correct,Wrong,Skipped,TimeTaken,Date'];

    for (const a of attempts) {
      csvRows.push(
        `"${a.user?.name || ''}","${a.user?.email || ''}","${a.user?.college || ''}","${a.test?.name || ''}",${a.score},${a.percentage}%,${a.accuracy}%,${a.correctAnswers},${a.wrongAnswers},${a.skippedQuestions},${a.timeTaken}s,"${a.submittedAt?.toISOString() || ''}"`
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get home page stats (public)
// @route   GET /api/stats
exports.getPublicStats = async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const totalTests = await Test.countDocuments({ isPublished: true });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCategories = await Category.countDocuments();

    res.json({
      success: true,
      data: { totalQuestions, totalTests, totalStudents, totalCategories }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
