const express = require('express');
const router = express.Router();
const { getUsers, getManagers, createUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('ADMIN'), getUsers)
  .post(protect, authorize('ADMIN'), createUser);

router.get('/managers', protect, authorize('ADMIN'), getManagers);

router.route('/:id')
  .delete(protect, authorize('ADMIN'), deleteUser);

module.exports = router;
