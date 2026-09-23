const express = require('express');
const router = express.Router();
const { getQuestions, getQuestion, getRandomQuestions, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getQuestions);
router.get('/random', getRandomQuestions);
router.get('/:id', getQuestion);
router.post('/', protect, admin, createQuestion);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);

module.exports = router;
