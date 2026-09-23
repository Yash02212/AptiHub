const Category = require('../models/Category');
const Topic = require('../models/Topic');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category with topics
// @route   GET /api/categories/:id
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const topics = await Topic.find({ category: req.params.id });
    res.json({ success: true, data: { category, topics } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const topics = await Topic.find({ category: category._id });
    res.json({ success: true, data: { category, topics } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- TOPICS ----

// @desc    Get topics by category
// @route   GET /api/topics
exports.getTopics = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const topics = await Topic.find(query).populate('category', 'name slug');
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create topic (Admin)
// @route   POST /api/topics
exports.createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update topic (Admin)
// @route   PUT /api/topics/:id
exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete topic (Admin)
// @route   DELETE /api/topics/:id
exports.deleteTopic = async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
