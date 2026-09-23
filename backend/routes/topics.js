const express = require('express');
const router = express.Router();
const { getTopics, createTopic, updateTopic, deleteTopic } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getTopics);
router.post('/', protect, admin, createTopic);
router.put('/:id', protect, admin, updateTopic);
router.delete('/:id', protect, admin, deleteTopic);

module.exports = router;
