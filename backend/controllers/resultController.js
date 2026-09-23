const TestAttempt = require('../models/TestAttempt');

// @desc    Get user results
// @route   GET /api/results
exports.getResults = async (req, res) => {
  try {
    const results = await TestAttempt.find({ user: req.user._id, status: 'completed' })
      .populate('test', 'name type difficulty duration')
      .sort({ submittedAt: -1 })
      .limit(50);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single result with solutions
// @route   GET /api/results/:id
exports.getResult = async (req, res) => {
  try {
    const result = await TestAttempt.findById(req.params.id)
      .populate('test', 'name type difficulty duration marksPerQuestion negativeMarking')
      .populate({
        path: 'answers.question',
        select: 'question options correctAnswer explanation difficulty topic category marks negativeMark',
        populate: [
          { path: 'topic', select: 'name' },
          { path: 'category', select: 'name' }
        ]
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user mistakes (wrong answers)
// @route   GET /api/results/mistakes
exports.getMistakes = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ user: req.user._id, status: 'completed' })
      .populate({
        path: 'answers.question',
        select: 'question options correctAnswer explanation difficulty topic category',
        populate: [
          { path: 'topic', select: 'name' },
          { path: 'category', select: 'name' }
        ]
      });

    // Collect wrong answers
    const mistakes = [];
    const questionMap = {};

    for (const attempt of attempts) {
      for (const ans of attempt.answers) {
        if (!ans.isSkipped && !ans.isCorrect && ans.question) {
          const qId = ans.question._id.toString();
          if (questionMap[qId]) {
            questionMap[qId].attempts += 1;
            questionMap[qId].wrongAttempts += 1;
          } else {
            questionMap[qId] = {
              question: ans.question,
              attempts: 1,
              correctAttempts: 0,
              wrongAttempts: 1
            };
          }
        } else if (!ans.isSkipped && ans.isCorrect && ans.question) {
          const qId = ans.question._id.toString();
          if (questionMap[qId]) {
            questionMap[qId].attempts += 1;
            questionMap[qId].correctAttempts += 1;
          }
        }
      }
    }

    // Filter to only questions that have been answered wrong at least once
    for (const qId in questionMap) {
      if (questionMap[qId].wrongAttempts > 0) {
        mistakes.push(questionMap[qId]);
      }
    }

    res.json({ success: true, data: mistakes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
