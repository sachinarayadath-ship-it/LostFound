const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerValidator, loginValidator } = require('../utils/validators');

router.post('/register', validate(registerValidator), registerUser);
router.post('/login', validate(loginValidator), loginUser);
router.get('/me', protect, getMe);

module.exports = router;
