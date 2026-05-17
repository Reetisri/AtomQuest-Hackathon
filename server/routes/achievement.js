const express = require('express');
const router = express.Router();
const { updateAchievement, getAchievements } = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('EMPLOYEE'), updateAchievement);

router.route('/:goalId')
  .get(protect, getAchievements);

module.exports = router;
