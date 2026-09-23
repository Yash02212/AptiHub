const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// @desc    Get all tests
// @route   GET /api/tests
exports.getTests = async (req, res) => {
  try {
    const { type, difficulty, category } = req.query;
    const query = { isPublished: true };
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const tests = await Test.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single test
// @route   GET /api/tests/:id
exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('category', 'name')
      .populate({
        path: 'questions',
        select: 'question options difficulty marks negativeMark category topic',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'topic', select: 'name' }
        ]
      });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start a test attempt
// @route   POST /api/tests/:id/start
exports.startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('questions');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Shuffle questions for each student
    const shuffledQuestions = [...test.questions].sort(() => Math.random() - 0.5);

    const attempt = await TestAttempt.create({
      user: req.user._id,
      test: test._id,
      answers: shuffledQuestions.map(q => ({
        question: q._id,
        selectedAnswer: null,
        isCorrect: false,
        isSkipped: true,
        markedForReview: false,
        timeTaken: 0
      })),
      totalQuestions: test.numberOfQuestions,
      totalMarks: test.totalMarks || test.numberOfQuestions * test.marksPerQuestion,
      status: 'in-progress',
      startedAt: new Date()
    });

    const populated = await TestAttempt.findById(attempt._id)
      .populate({
        path: 'answers.question',
        select: 'question options difficulty marks negativeMark'
      });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a test
// @route   POST /api/tests/:id/submit
exports.submitTest = async (req, res) => {
  try {
    const { attemptId, answers, timeTaken } = req.body;
    
    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Test already submitted' });
    }

    const test = await Test.findById(req.params.id);

    // Evaluate answers
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    for (let i = 0; i < attempt.answers.length; i++) {
      const question = await Question.findById(attempt.answers[i].question);
      const userAnswer = answers ? answers[attempt.answers[i].question.toString()] : null;
      
      if (!userAnswer || userAnswer === null) {
        attempt.answers[i].isSkipped = true;
        skipped++;
      } else {
        attempt.answers[i].selectedAnswer = userAnswer;
        attempt.answers[i].isSkipped = false;
        
        if (userAnswer === question.correctAnswer) {
          attempt.answers[i].isCorrect = true;
          score += question.marks || test.marksPerQuestion;
          correct++;
        } else {
          attempt.answers[i].isCorrect = false;
          score -= question.negativeMark || test.negativeMarking || 0;
          wrong++;
        }
      }
      
      // Update question stats
      await Question.findByIdAndUpdate(question._id, {
        $inc: { timesAttempted: 1, timesCorrect: attempt.answers[i].isCorrect ? 1 : 0 }
      });
    }

    const totalMarks = attempt.totalMarks;
    const percentage = totalMarks > 0 ? Math.round((Math.max(0, score) / totalMarks) * 100) : 0;
    const answered = correct + wrong;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    attempt.score = Math.max(0, score);
    attempt.percentage = percentage;
    attempt.accuracy = accuracy;
    attempt.correctAnswers = correct;
    attempt.wrongAnswers = wrong;
    attempt.skippedQuestions = skipped;
    attempt.timeTaken = timeTaken || 0;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    await attempt.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalTestsAttempted: 1, totalQuestionsSolved: correct + wrong }
    });

    // Update test attempt count
    await Test.findByIdAndUpdate(test._id, { $inc: { attemptCount: 1 } });

    // Update progress
    await updateProgress(req.user._id, attempt, test);

    // Update streak
    await updateStreak(req.user._id);

    // Award XP
    const xpEarned = Math.round(percentage * 0.5) + correct * 2;
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Test Result Ready',
      message: `You scored ${percentage}% in "${test.name}". ${correct} correct out of ${attempt.totalQuestions} questions.`,
      type: 'result',
      link: `/results/${attempt._id}`
    });

    const result = await TestAttempt.findById(attempt._id)
      .populate('test', 'name type')
      .populate({
        path: 'answers.question',
        select: 'question options correctAnswer explanation difficulty topic category',
        populate: [
          { path: 'topic', select: 'name' },
          { path: 'category', select: 'name' }
        ]
      });

    res.json({ success: true, data: result, xpEarned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update progress after test
async function updateProgress(userId, attempt, test) {
  try {
    let progress = await Progress.findOne({ user: userId });
    if (!progress) {
      progress = await Progress.create({ user: userId });
    }

    // Add to score history
    progress.scoreHistory.push({
      testId: test._id,
      testName: test.name,
      score: attempt.score,
      percentage: attempt.percentage,
      accuracy: attempt.accuracy,
      date: new Date()
    });

    // Keep last 50 scores
    if (progress.scoreHistory.length > 50) {
      progress.scoreHistory = progress.scoreHistory.slice(-50);
    }

    // Update topic performance
    for (const ans of attempt.answers) {
      const question = await Question.findById(ans.question).populate('topic', 'name').populate('category', 'name');
      if (!question || ans.isSkipped) continue;

      const topicIdx = progress.topicPerformance.findIndex(
        tp => tp.topic && tp.topic.toString() === question.topic._id.toString()
      );

      if (topicIdx >= 0) {
        progress.topicPerformance[topicIdx].totalAttempted += 1;
        if (ans.isCorrect) progress.topicPerformance[topicIdx].totalCorrect += 1;
        progress.topicPerformance[topicIdx].accuracy = Math.round(
          (progress.topicPerformance[topicIdx].totalCorrect / progress.topicPerformance[topicIdx].totalAttempted) * 100
        );
        progress.topicPerformance[topicIdx].lastAttempted = new Date();
      } else {
        progress.topicPerformance.push({
          topic: question.topic._id,
          topicName: question.topic.name,
          categoryName: question.category.name,
          totalAttempted: 1,
          totalCorrect: ans.isCorrect ? 1 : 0,
          accuracy: ans.isCorrect ? 100 : 0,
          lastAttempted: new Date()
        });
      }

      // Update category performance
      const catIdx = progress.categoryPerformance.findIndex(
        cp => cp.category && cp.category.toString() === question.category._id.toString()
      );

      if (catIdx >= 0) {
        progress.categoryPerformance[catIdx].totalAttempted += 1;
        if (ans.isCorrect) progress.categoryPerformance[catIdx].totalCorrect += 1;
        progress.categoryPerformance[catIdx].accuracy = Math.round(
          (progress.categoryPerformance[catIdx].totalCorrect / progress.categoryPerformance[catIdx].totalAttempted) * 100
        );
      } else {
        progress.categoryPerformance.push({
          category: question.category._id,
          categoryName: question.category.name,
          totalAttempted: 1,
          totalCorrect: ans.isCorrect ? 1 : 0,
          accuracy: ans.isCorrect ? 100 : 0
        });
      }

      // Update difficulty performance
      const diff = question.difficulty;
      if (progress.difficultyPerformance[diff]) {
        progress.difficultyPerformance[diff].attempted += 1;
        if (ans.isCorrect) progress.difficultyPerformance[diff].correct += 1;
      }
    }

    // Identify weak and strong topics
    const sorted = [...progress.topicPerformance].filter(t => t.totalAttempted >= 3);
    progress.weakTopics = sorted.filter(t => t.accuracy < 50).map(t => t.topicName);
    progress.strongTopics = sorted.filter(t => t.accuracy >= 75).map(t => t.topicName);

    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    const dailyIdx = progress.dailyActivity.findIndex(
      d => d.date && d.date.toISOString().split('T')[0] === today
    );

    if (dailyIdx >= 0) {
      progress.dailyActivity[dailyIdx].questionsSolved += attempt.correctAnswers + attempt.wrongAnswers;
      progress.dailyActivity[dailyIdx].testsCompleted += 1;
    } else {
      progress.dailyActivity.push({
        date: new Date(),
        questionsSolved: attempt.correctAnswers + attempt.wrongAnswers,
        testsCompleted: 1,
        xpEarned: 0
      });
    }

    await progress.save();
  } catch (error) {
    console.error('Error updating progress:', error);
  }
}

// Update streak
async function updateStreak(userId) {
  try {
    const user = await User.findById(userId);
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.streak.lastActiveDate 
      ? user.streak.lastActiveDate.toISOString().split('T')[0] 
      : null;

    if (lastActive === today) return; // Already active today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      user.streak.current += 1;
    } else {
      user.streak.current = 1;
    }

    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    user.streak.lastActiveDate = new Date();
    await user.save();
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

// @desc    Create test (Admin)
// @route   POST /api/tests
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update test (Admin)
// @route   PUT /api/tests/:id
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete test (Admin)
// @route   DELETE /api/tests/:id
exports.deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tests for admin (including unpublished)
// @route   GET /api/tests/admin/all
exports.getAllTestsAdmin = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
