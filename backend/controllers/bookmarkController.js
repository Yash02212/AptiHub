const Bookmark = require('../models/Bookmark');

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'question',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'topic', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add bookmark
// @route   POST /api/bookmarks
exports.addBookmark = async (req, res) => {
  try {
    const existing = await Bookmark.findOne({ user: req.user._id, question: req.body.questionId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already bookmarked' });
    }
    const bookmark = await Bookmark.create({
      user: req.user._id,
      question: req.body.questionId
    });
    res.status(201).json({ success: true, data: bookmark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:questionId
exports.removeBookmark = async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ user: req.user._id, question: req.params.questionId });
    res.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if bookmarked
// @route   GET /api/bookmarks/check/:questionId
exports.checkBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({ user: req.user._id, question: req.params.questionId });
    res.json({ success: true, isBookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
