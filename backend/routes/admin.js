const express = require('express');
const router = express.Router();
const { getDashboard, getStudents, toggleBlock, deleteStudent, getAnalytics, exportResults } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/dashboard', protect, admin, getDashboard);
router.get('/students', protect, admin, getStudents);
router.put('/students/:id/block', protect, admin, toggleBlock);
router.delete('/students/:id', protect, admin, deleteStudent);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/export', protect, admin, exportResults);

module.exports = router;
