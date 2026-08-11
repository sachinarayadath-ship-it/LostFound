const express = require('express');
const router = express.Router();
const {
  getAdminItems,
  moderateItem,
  getAdminUsers,
  setUserRole,
  getAdminAnalytics,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/items', getAdminItems);
router.put('/items/:id/:action', moderateItem);
router.put('/items/:id/status', moderateItem);

router.get('/users', getAdminUsers);
router.put('/users/:id/role', setUserRole);

router.get('/analytics', getAdminAnalytics);

module.exports = router;
