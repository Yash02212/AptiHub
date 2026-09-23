const express = require('express');
const router = express.Router();
const { getResults, getResult, getMistakes } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getResults);
router.get('/mistakes', protect, getMistakes);
router.get('/:id', protect, getResult);

module.exports = router;
