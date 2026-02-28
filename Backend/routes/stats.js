const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { detectTrending } = require('../algorithms/trendingDetection');

// ─── Dashboard stats (admin) ───
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const [totalUsers, grievances] = await Promise.all([
      User.countDocuments(),
      Grievance.find(),
    ]);

    const total = grievances.length;
    const pending = grievances.filter((g) => g.status === 'Pending').length;
    const resolved = grievances.filter((g) => g.status === 'Resolved').length;

    // Category breakdown
    const categoryMap = {};
    grievances.forEach((g) => {
      categoryMap[g.category] = (categoryMap[g.category] || 0) + 1;
    });
    const categories = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      count: categoryMap[cat],
      pct: total === 0 ? 0 : Math.round((categoryMap[cat] / total) * 100),
    }));

    // Recent grievances
    const recentGrievances = await Grievance.find()
      .sort({ date: -1 })
      .limit(5);

    // Attach citizen names to recent grievances
    const userIds = [...new Set(recentGrievances.map((g) => g.userId))];
    const users = await User.find({ citizenId: { $in: userIds } }).select('citizenId name');
    const userMap = {};
    users.forEach((u) => { userMap[u.citizenId] = u.name; });

    const recentWithNames = recentGrievances.map((g) => ({
      ...g.toObject(),
      citizenName: userMap[g.userId] || 'Unknown',
    }));

    // Algorithm 3: Trending issues detection
    const trending = detectTrending(grievances.map(g => g.toObject()));

    res.json({
      totalGrievances: total,
      pending,
      resolved,
      totalUsers,
      categories,
      recentGrievances: recentWithNames,
      trending,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Reports data (admin) ───
router.get('/reports', auth, role('admin'), async (req, res) => {
  try {
    const [users, grievances] = await Promise.all([
      User.find().select('registeredAt'),
      Grievance.find(),
    ]);

    // Monthly registration trend
    const monthMap = {};
    users.forEach((user) => {
      if (!user.registeredAt) return;
      const date = new Date(user.registeredAt);
      const month = date.toLocaleString('default', { month: 'short' });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const months = Object.keys(monthMap).map((m) => ({
      m,
      count: monthMap[m],
    }));

    // Resolution rate
    const total = grievances.length;
    const resolved = grievances.filter((g) => g.status === 'Resolved').length;
    const resolutionRate = total === 0 ? 0 : ((resolved / total) * 100).toFixed(1);

    // Average resolution time
    const resolvedGrievances = grievances.filter(
      (g) => g.status === 'Resolved' && g.date && g.resolvedAt
    );

    let avgDays = 0;
    if (resolvedGrievances.length > 0) {
      const totalDays = resolvedGrievances.reduce((sum, g) => {
        const created = new Date(g.date);
        const resolvedDate = new Date(g.resolvedAt);
        const diff = (resolvedDate - created) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0);
      avgDays = (totalDays / resolvedGrievances.length).toFixed(1);
    }

    res.json({
      months,
      resolutionRate,
      avgDays,
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
