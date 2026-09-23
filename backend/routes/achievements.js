const express = require('express');
const router = express.Router();
const { getAchievements } = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAchievements);

module.exports = router;
