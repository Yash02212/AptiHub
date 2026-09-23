const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');

// @desc    Get all achievements with user status
// @route   GET /api/achievements
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    const userAchievements = await UserAchievement.find({ user: req.user._id });
    const earnedIds = userAchievements.map(ua => ua.achievement.toString());

    const data = achievements.map(a => ({
      ...a.toObject(),
      earned: earnedIds.includes(a._id.toString()),
      earnedAt: userAchievements.find(ua => ua.achievement.toString() === a._id.toString())?.earnedAt
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check and award achievements
exports.checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    const achievements = await Achievement.find();
    const earned = await UserAchievement.find({ user: userId });
    const earnedIds = earned.map(e => e.achievement.toString());

    for (const achievement of achievements) {
      if (earnedIds.includes(achievement._id.toString())) continue;

      let qualifies = false;

      switch (achievement.type) {
        case 'tests':
          qualifies = user.totalTestsAttempted >= achievement.criteria.value;
          break;
        case 'streak':
          qualifies = user.streak.current >= achievement.criteria.value;
          break;
        case 'questions':
          qualifies = user.totalQuestionsSolved >= achievement.criteria.value;
          break;
        default:
          break;
      }

      if (qualifies) {
        await UserAchievement.create({
          user: userId,
          achievement: achievement._id
        });
        await User.findByIdAndUpdate(userId, { $inc: { xp: achievement.xpReward } });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};
