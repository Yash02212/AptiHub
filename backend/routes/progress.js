const express = require('express');
const router = express.Router();
const { getProgress, getRecommendations } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProgress);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
