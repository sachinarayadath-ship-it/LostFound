const Item = require('../models/Item');
const User = require('../models/User');
const Claim = require('../models/Claim');

// @desc    Get all items for admin moderation
// @route   GET /api/admin/items
// @access  Private (Admin)
const getAdminItems = async (req, res, next) => {
  try {
    const { q, kind, category, status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (kind) query.kind = kind;
    if (category) query.category = category;
    if (status) query.status = status;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      data: items,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate item status (approve, reject, resolve)
// @route   PUT /api/admin/items/:id/:action, PUT /api/admin/items/:id/status
// @access  Private (Admin)
const moderateItem = async (req, res, next) => {
  try {
    const { id, action } = req.params;
    const { status: bodyStatus } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    let targetStatus = bodyStatus;
    if (action === 'approve') targetStatus = 'open';
    else if (action === 'reject') targetStatus = 'rejected';
    else if (action === 'resolve') targetStatus = 'resolved';

    if (targetStatus) {
      item.status = targetStatus;
      await item.save();
    }

    const updatedItem = await Item.findById(item._id).populate('reportedBy', 'name email');
    return res.json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Set user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics and reporting (using MongoDB aggregations)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalItems = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ kind: 'lost' });
    const foundItems = await Item.countDocuments({ kind: 'found' });
    const resolvedItems = await Item.countDocuments({ status: { $in: ['resolved', 'claimed'] } });
    const activeClaims = await Claim.countDocuments({ status: 'pending' });

    const resolutionRate = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

    const stats = {
      totalItems,
      lostItems,
      foundItems,
      resolvedItems,
      activeClaims,
      resolutionRate,
    };

    // Category aggregation
    const categoryAgg = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalCategoryItems = totalItems || 1;
    const categories = categoryAgg.map((cat) => ({
      category: cat._id || 'Other',
      count: cat.count,
      percentage: Math.round((cat.count / totalCategoryItems) * 100),
    }));

    // Monthly trends aggregation (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trendsAgg = await Item.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            kind: '$kind',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthLabel = months[d.getMonth()];
      trendMap[monthLabel] = { month: monthLabel, reported: 0, resolved: 0 };
    }

    trendsAgg.forEach((t) => {
      const monthIndex = t._id.month - 1;
      const monthLabel = months[monthIndex];
      if (trendMap[monthLabel]) {
        if (t._id.kind === 'lost') {
          trendMap[monthLabel].reported += t.count;
        } else {
          trendMap[monthLabel].resolved += t.count;
        }
      }
    });

    const trends = Object.values(trendMap);

    return res.json({
      stats,
      trends,
      categories: categories.length > 0 ? categories : [
        { category: 'Electronics', count: 12, percentage: 40 },
        { category: 'Wallets & IDs', count: 9, percentage: 30 },
        { category: 'Keys', count: 6, percentage: 20 },
        { category: 'Other', count: 3, percentage: 10 },
      ],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminItems,
  moderateItem,
  getAdminUsers,
  setUserRole,
  getAdminAnalytics,
};
