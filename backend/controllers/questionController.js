const Question = require('../models/Question');
const Category = require('../models/Category');
const Topic = require('../models/Topic');

// @desc    Get questions with filters
// @route   GET /api/questions
exports.getQuestions = async (req, res) => {
  try {
    const { category, topic, difficulty, page = 1, limit = 20, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.question = { $regex: search, $options: 'i' };

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('category', 'name')
      .populate('topic', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get random questions for practice
// @route   GET /api/questions/random
exports.getRandomQuestions = async (req, res) => {
  try {
    const { category, topic, difficulty, count = 10 } = req.query;
    const match = { isActive: true };

    if (category) match.category = require('mongoose').Types.ObjectId.createFromHexString(category);
    if (topic) match.topic = require('mongoose').Types.ObjectId.createFromHexString(topic);
    if (difficulty) match.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: parseInt(count) } }
    ]);

    // Populate references
    const populated = await Question.populate(questions, [
      { path: 'category', select: 'name' },
      { path: 'topic', select: 'name' }
    ]);

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('category', 'name')
      .populate('topic', 'name');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create question (Admin)
// @route   POST /api/questions
exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    
    // Update counts
    await Category.findByIdAndUpdate(req.body.category, { $inc: { questionCount: 1 } });
    await Topic.findByIdAndUpdate(req.body.topic, { $inc: { questionCount: 1 } });
    
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update question (Admin)
// @route   PUT /api/questions/:id
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete question (Admin)
// @route   DELETE /api/questions/:id
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    await Category.findByIdAndUpdate(question.category, { $inc: { questionCount: -1 } });
    await Topic.findByIdAndUpdate(question.topic, { $inc: { questionCount: -1 } });
    
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
