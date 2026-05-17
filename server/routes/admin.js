const express = require('express');
const router = express.Router();
const { getDashboardStats, getCycle } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('ADMIN'), getDashboardStats);
router.get('/cycle', protect, getCycle); // Everyone can get cycle to know if UI is disabled

module.exports = router;
