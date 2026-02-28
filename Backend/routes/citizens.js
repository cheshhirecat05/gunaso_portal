const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// ─── Get all citizens (admin) ───
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find().select('-password').sort({ registeredAt: -1 }).skip(skip).limit(limit);

    // Attach grievance count per user
    const userIds = users.map(u => u.citizenId);
    const grievanceCounts = await Grievance.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(grievanceCounts.map(g => [g._id, g.count]));

    const usersWithCounts = users.map((u) => {
      const userObj = u.toObject();
      userObj.grievanceCount = countMap[u.citizenId] || 0;
      return userObj;
    });

    res.json({ citizens: usersWithCounts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get citizens error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Get citizen profile ───
router.get('/profile', auth, role('citizen'), async (req, res) => {
  try {
    const user = await User.findOne({ citizenId: req.user.id }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      id: user.citizenId,
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address,
      registeredAt: user.registeredAt,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Update citizen profile ───
router.put('/profile', auth, role('citizen'), async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findOneAndUpdate(
      { citizenId: req.user.id },
      { name, phone, address },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.citizenId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        registeredAt: user.registeredAt,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
