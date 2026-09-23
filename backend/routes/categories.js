const express = require('express');
const router = express.Router();
const { getCategories, getCategory, getCategoryBySlug, createCategory, updateCategory, deleteCategory,
        getTopics, createTopic, updateTopic, deleteTopic } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

// Categories
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/slug/:slug', getCategoryBySlug);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
