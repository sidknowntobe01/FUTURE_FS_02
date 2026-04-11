const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const protect = require('../middleware/auth');

// ── GET /api/members ─────────────────────────────── List All
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, plan, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (plan && plan !== 'All') filter.membershipPlan = plan;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Member.countDocuments(filter);
    const members = await Member.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/members ──────────────────────────── Add Member
router.post('/', protect, async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A member with this email already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/members/:id ───────────────────────── Get One
router.get('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/members/:id ───────────────────────── Update
router.put('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/members/:id ────────────────────── Delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/members/:id/status ─────────────── Toggle Status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Expired', 'Left'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const member = await Member.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/members/public/register ─────────── Public Form
router.post('/public/register', async (req, res) => {
  try {
    const { name, email, phone, age, gender, membershipPlan, fitnessGoal } = req.body;

    // Calculate expiry based on plan
    const planDurations = { Basic: 30, Standard: 90, Premium: 365 };
    const days = planDurations[membershipPlan] || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const planPrices = { Basic: 999, Standard: 2499, Premium: 5999 };

    const member = await Member.create({
      name, email, phone, age, gender,
      membershipPlan: membershipPlan || 'Basic',
      fitnessGoal: fitnessGoal || 'General Fitness',
      expiryDate,
      amountPaid: planPrices[membershipPlan] || 999,
      status: 'Active'
    });

    res.status(201).json({ success: true, message: 'Registration successful! Welcome to Ydv Core Fitness!', data: member });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'This email is already registered' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
