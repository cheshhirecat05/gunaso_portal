const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const Counter = require('../models/Counter');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { rankGrievances } = require('../algorithms/priorityScoring');
const { findSimilarGrievances } = require('../algorithms/duplicateDetection');

// ─── Submit Grievance (citizen) ───
router.post('/', auth, role('citizen'), async (req, res) => {
  try {
    const { subject, category, priority, location, desc, attachment } = req.body;

    if (!subject || !category || !location || !desc) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const ticketNo = await Counter.getNextTicketNo();

    const grievance = await Grievance.create({
      ticketNo,
      userId: req.user.id,
      userName: req.body.userName || 'Citizen',
      subject,
      category,
      priority: priority || 'Normal',
      location,
      desc,
      attachment: attachment || null,
      status: 'Pending',
      date: new Date(),
    });

    // Algorithm 2: Check for similar/duplicate grievances
    const existing = await Grievance.find({ userId: req.user.id }).limit(200);
    const similar = findSimilarGrievances(
      { subject, desc, location },
      existing
    );

    res.status(201).json({
      message: `Grievance submitted! Ticket: ${ticketNo}`,
      grievance,
      similarGrievances: similar,
    });
  } catch (err) {
    console.error('Submit grievance error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Get my grievances (citizen) ───
router.get('/my', auth, role('citizen'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id };
    const total = await Grievance.countDocuments(filter);
    const grievances = await Grievance.find(filter).sort({ date: -1 }).skip(skip).limit(limit);

    res.json({ grievances, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get my grievances error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Track grievance by ticket number (public) ───
router.get('/track/:ticketNo', async (req, res) => {
  try {
    const grievance = await Grievance.findOne({
      ticketNo: req.params.ticketNo.toUpperCase(),
    });

    if (!grievance) {
      return res.status(404).json({ error: `No ticket found with number "${req.params.ticketNo}".` });
    }

    res.json({
      ticketNo: grievance.ticketNo,
      subject: grievance.subject,
      category: grievance.category,
      priority: grievance.priority,
      location: grievance.location,
      status: grievance.status,
      date: grievance.date,
    });
  } catch (err) {
    console.error('Track grievance error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Get all grievances (admin) ───
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const { search, status, category } = req.query;
    const filter = {};

    if (status && status !== 'All Status') {
      filter.status = status;
    }
    if (category && category !== 'All Categories') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { ticketNo: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const total = await Grievance.countDocuments(filter);
    let grievances = await Grievance.find(filter).sort({ date: -1 }).skip(skip).limit(limit);

    // Algorithm 1: Attach priority scores when requested
    if (req.query.scored === 'true') {
      grievances = rankGrievances(grievances);
    }

    res.json({ grievances, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get all grievances error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Edit grievance (citizen, only if Pending) ───
router.put('/:ticketNo', auth, role('citizen'), async (req, res) => {
  try {
    const { subject, category, priority, location, desc, attachment } = req.body;

    const grievance = await Grievance.findOne({
      ticketNo: req.params.ticketNo,
      userId: req.user.id,
    });

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found.' });
    }

    if (grievance.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending grievances can be edited.' });
    }

    if (subject) grievance.subject = subject;
    if (category) grievance.category = category;
    if (priority) grievance.priority = priority;
    if (location) grievance.location = location;
    if (desc) grievance.desc = desc;
    if (attachment !== undefined) grievance.attachment = attachment || null;

    await grievance.save();

    res.json({ message: 'Grievance updated successfully.', grievance });
  } catch (err) {
    console.error('Edit grievance error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Update grievance status (admin) ───
router.put('/:ticketNo/status', auth, role('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Review', 'Resolved', 'Urgent'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const update = { status };
    if (status === 'Resolved') {
      update.resolvedAt = new Date();
    }

    const grievance = await Grievance.findOneAndUpdate(
      { ticketNo: req.params.ticketNo },
      update,
      { new: true }
    );

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found.' });
    }

    res.json({ message: 'Status updated.', grievance });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Check for similar grievances before submission (citizen) ───
router.post('/check-similar', auth, role('citizen'), async (req, res) => {
  try {
    const { subject, desc, location } = req.body;
    const existing = await Grievance.find().limit(500);
    const similar = findSimilarGrievances({ subject, desc, location }, existing);
    res.json({ similar });
  } catch (err) {
    console.error('Check similar error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── Get priority-ranked grievances (admin) ───
router.get('/ranked', auth, role('admin'), async (req, res) => {
  try {
    const grievances = await Grievance.find({ status: { $ne: 'Resolved' } });
    const ranked = rankGrievances(grievances);
    res.json(ranked.slice(0, 20));
  } catch (err) {
    console.error('Ranked grievances error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
