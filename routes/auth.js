const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Validation helpers ─────────────────────────────────────────
const isValidEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone    = (v) => !v || /^\+91[6-9]\d{9}$/.test(v.replace(/\s/g,''));
const isValidPassword = (v) => {
  if (!v || v.length < 4) return false;
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);
  const numCount   = (v.match(/\d/g) || []).length;
  return hasSpecial && numCount >= 3;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });
    if (phone && !isValidPhone(phone))
      return res.status(400).json({ message: 'Phone must start with +91 followed by 10 digits (e.g. +91 9876543210)' });
    if (!password || !isValidPassword(password))
      return res.status(400).json({ message: 'Password must be at least 4 characters, contain 3 numbers and 1 special character' });
    if (!role || !['customer','owner','delivery'].includes(role))
      return res.status(400).json({ message: 'Invalid role selected' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered. Please login.' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role,
      phone: phone ? phone.replace(/\s/g,'') : '',
      address: address || '',
      isActive: true
    });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });
    if (!password || password.length < 1)
      return res.status(400).json({ message: 'Please enter your password' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (user.role === 'delivery' && user.isActive === false)
      return res.status(403).json({ message: 'Your account has been removed. Contact the restaurant owner.' });

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public: all visible users for login panel
router.get('/demo-users', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { role: { $in: ['customer','owner'] } },
        { role: 'delivery', isActive: { $ne: false } }
      ]
    })
      .select('name email role phone createdAt isActive')
      .sort({ role: 1, createdAt: 1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: remove delivery person
router.put('/remove-delivery/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery')
      return res.status(404).json({ message: 'Delivery person not found' });
    user.isActive = false; user.isAvailable = false;
    await user.save();
    res.json({ message: `${user.name} removed from delivery team` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: reinstate delivery person
router.put('/reinstate-delivery/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery')
      return res.status(404).json({ message: 'Delivery person not found' });
    user.isActive = true; user.isAvailable = true;
    await user.save();
    res.json({ message: `${user.name} reinstated` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
