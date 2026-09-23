const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, removeBookmark, checkBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBookmarks);
router.post('/', protect, addBookmark);
router.get('/check/:questionId', protect, checkBookmark);
router.delete('/:questionId', protect, removeBookmark);

module.exports = router;
