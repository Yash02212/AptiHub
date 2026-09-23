const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'global', limit = 50 } = req.query;
    let query = { role: 'student', isBlocked: false };

    let users;

    if (type === 'global') {
      users = await User.find(query)
        .select('name college xp totalTestsAttempted totalQuestionsSolved streak')
        .sort({ xp: -1 })
        .limit(parseInt(limit));
    } else if (type === 'weekly') {
      // Get weekly top scores
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyScores = await TestAttempt.aggregate([
        { $match: { status: 'completed', submittedAt: { $gte: weekAgo } } },
        { $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          testsCompleted: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' }
        }},
        { $sort: { totalScore: -1 } },
        { $limit: parseInt(limit) }
      ]);

      const userIds = weeklyScores.map(s => s._id);
      const userMap = {};
      const usersData = await User.find({ _id: { $in: userIds } }).select('name college xp');
      usersData.forEach(u => { userMap[u._id.toString()] = u; });

      users = weeklyScores.map((s, i) => ({
        rank: i + 1,
        user: userMap[s._id.toString()],
        totalScore: s.totalScore,
        testsCompleted: s.testsCompleted,
        avgPercentage: Math.round(s.avgPercentage)
      }));

      return res.json({ success: true, data: users, type: 'weekly' });
    } else if (type === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const monthlyScores = await TestAttempt.aggregate([
        { $match: { status: 'completed', submittedAt: { $gte: monthAgo } } },
        { $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          testsCompleted: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' }
        }},
        { $sort: { totalScore: -1 } },
        { $limit: parseInt(limit) }
      ]);

      const userIds = monthlyScores.map(s => s._id);
      const userMap = {};
      const usersData = await User.find({ _id: { $in: userIds } }).select('name college xp');
      usersData.forEach(u => { userMap[u._id.toString()] = u; });

      users = monthlyScores.map((s, i) => ({
        rank: i + 1,
        user: userMap[s._id.toString()],
        totalScore: s.totalScore,
        testsCompleted: s.testsCompleted,
        avgPercentage: Math.round(s.avgPercentage)
      }));

      return res.json({ success: true, data: users, type: 'monthly' });
    } else if (type === 'college') {
      const { college } = req.query;
      if (college) {
        query.college = college;
      } else if (req.user) {
        query.college = req.user.college;
      }
      users = await User.find(query)
        .select('name college xp totalTestsAttempted')
        .sort({ xp: -1 })
        .limit(parseInt(limit));
    }

    const leaderboard = (users || []).map((user, i) => ({
      rank: i + 1,
      name: user.name,
      college: user.college,
      xp: user.xp,
      testsCompleted: user.totalTestsAttempted,
      streak: user.streak?.current || 0
    }));

    res.json({ success: true, data: leaderboard, type });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
