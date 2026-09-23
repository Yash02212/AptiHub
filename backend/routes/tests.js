const express = require('express');
const router = express.Router();
const { getTests, getTest, startTest, submitTest, createTest, updateTest, deleteTest, getAllTestsAdmin } = require('../controllers/testController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getTests);
router.get('/admin/all', protect, admin, getAllTestsAdmin);
router.get('/:id', getTest);
router.post('/:id/start', protect, startTest);
router.post('/:id/submit', protect, submitTest);
router.post('/', protect, admin, createTest);
router.put('/:id', protect, admin, updateTest);
router.delete('/:id', protect, admin, deleteTest);

module.exports = router;
