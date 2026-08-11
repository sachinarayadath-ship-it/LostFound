const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.put('/me', protect, updateProfile);
router.put('/profile', protect, updateProfile); // alias
router.put('/me/password', protect, changePassword);

module.exports = router;
