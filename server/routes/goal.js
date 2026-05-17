const express = require('express');
const router = express.Router();
const { getGoals, createGoals, updateGoalStatus } = require('../controllers/goalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getGoals)
  .post(protect, authorize('EMPLOYEE'), createGoals);

router.route('/:id/status')
  .put(protect, authorize('MANAGER', 'ADMIN'), updateGoalStatus);

module.exports = router;
