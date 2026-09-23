const DailyChallenge = require('../models/DailyChallenge');
const DailyChallengeAttempt = require('../models/DailyChallengeAttempt');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get today's challenge
// @route   GET /api/daily-challenge
exports.getDailyChallenge = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenge = await DailyChallenge.findOne({
      date: { $gte: today }
    }).populate('topic', 'name').populate({
      path: 'questions',
      select: 'question options difficulty marks'
    });

    // Auto-generate if no challenge exists for today
    if (!challenge) {
      const questions = await Question.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 5 } }
      ]);

      if (questions.length > 0) {
        challenge = await DailyChallenge.create({
          date: today,
          questions: questions.map(q => q._id),
          numberOfQuestions: questions.length,
          duration: 10,
          xpReward: 50,
          topicName: 'Mixed',
          isActive: true
        });
        challenge = await DailyChallenge.findById(challenge._id)
          .populate('topic', 'name')
          .populate({ path: 'questions', select: 'question options difficulty marks' });
      }
    }

    // Check if user already attempted
    let attempted = false;
    if (req.user && challenge) {
      const attempt = await DailyChallengeAttempt.findOne({
        user: req.user._id,
        challenge: challenge._id
      });
      attempted = !!attempt;
    }

    res.json({ success: true, data: challenge, attempted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit daily challenge
// @route   POST /api/daily-challenge/submit
exports.submitDailyChallenge = async (req, res) => {
  try {
    const { challengeId, answers } = req.body;

    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if already attempted
    const existing = await DailyChallengeAttempt.findOne({
      user: req.user._id,
      challenge: challengeId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already completed today\'s challenge' });
    }

    // Evaluate
    let correct = 0;
    const answerDetails = [];

    for (const qId of challenge.questions) {
      const question = await Question.findById(qId);
      const userAnswer = answers[qId.toString()];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correct++;

      answerDetails.push({
        question: qId,
        selectedAnswer: userAnswer || null,
        isCorrect
      });
    }

    const totalQ = challenge.questions.length;
    const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
    const xpEarned = Math.round(challenge.xpReward * (correct / totalQ));

    const attempt = await DailyChallengeAttempt.create({
      user: req.user._id,
      challenge: challengeId,
      answers: answerDetails,
      score: correct,
      totalQuestions: totalQ,
      accuracy,
      completed: true,
      xpEarned
    });

    // Award XP
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });

    // Notification
    await Notification.create({
      user: req.user._id,
      title: 'Daily Challenge Complete!',
      message: `You scored ${correct}/${totalQ} and earned ${xpEarned} XP!`,
      type: 'challenge'
    });

    res.json({ success: true, data: attempt, xpEarned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
