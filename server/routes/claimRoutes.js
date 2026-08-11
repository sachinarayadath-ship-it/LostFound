const express = require('express');
const router = express.Router();
const { createClaim, getMyClaims, approveClaim, rejectClaim } = require('../controllers/claimController');
const { protect, adminOnly } = require('../middleware/auth');
const { validate, claimValidator } = require('../utils/validators');

router.post('/', protect, validate(claimValidator), createClaim);
router.get('/mine', protect, getMyClaims);
router.get('/my-claims', protect, getMyClaims);

router.put('/:id/approve', protect, approveClaim);
router.put('/:id/reject', protect, rejectClaim);

module.exports = router;
