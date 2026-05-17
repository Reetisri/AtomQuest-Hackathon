const express = require('express');
const router = express.Router();
const { loginUser, getMe, registerUser, getManagersPublic } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/managers-public', getManagersPublic);
router.get('/me', protect, getMe);

module.exports = router;
