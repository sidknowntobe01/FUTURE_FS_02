const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const protect = require('../middleware/auth');

// ── GET /api/stats ───────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      leftMembers,
      newThisMonth,
      newThisWeek,
      revenueAgg,
      planBreakdown
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Member.countDocuments({ status: 'Expired' }),
      Member.countDocuments({ status: 'Left' }),
      Member.countDocuments({ joiningDate: { $gte: startOfMonth } }),
      Member.countDocuments({ joiningDate: { $gte: startOfWeek } }),
      Member.aggregate([{ $group: { _id: null, total: { $sum: '$amountPaid' } } }]),
      Member.aggregate([{ $group: { _id: '$membershipPlan', count: { $sum: 1 } } }])
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly trend (last 6 months)
    const monthlyTrend = await Member.aggregate([
      {
        $match: {
          joiningDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joiningDate' },
            month: { $month: '$joiningDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amountPaid' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        expiredMembers,
        leftMembers,
        newThisMonth,
        newThisWeek,
        totalRevenue,
        planBreakdown,
        monthlyTrend
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
