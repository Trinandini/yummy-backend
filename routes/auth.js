const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered. Please login.' });
    const user = await User.create({
      name, email: email.toLowerCase(), password, role, phone, address,
      isActive: true   // always explicitly set true on new registrations
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
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Block ONLY explicitly removed delivery persons (isActive === false)
    if (user.role === 'delivery' && user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been removed by the owner. Contact the restaurant.' });
    }
    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public: all visible users for login panel
// Excludes only explicitly removed delivery persons (isActive === false)
router.get('/demo-users', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { role: { $in: ['customer', 'owner'] } },           // all customers & owners
        { role: 'delivery', isActive: { $ne: false } }      // delivery: only non-removed
      ]
    })
      .select('name email role phone createdAt isActive')
      .sort({ role: 1, createdAt: 1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: remove a delivery person (sets isActive = false explicitly)
router.put('/remove-delivery/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery') return res.status(404).json({ message: 'Delivery person not found' });
    user.isActive = false;
    user.isAvailable = false;
    await user.save();
    res.json({ message: `${user.name} removed from the delivery team` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: reinstate a removed delivery person
router.put('/reinstate-delivery/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery') return res.status(404).json({ message: 'Delivery person not found' });
    user.isActive = true;
    user.isAvailable = true;
    await user.save();
    res.json({ message: `${user.name} reinstated to delivery team` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
// INTERNAL: One-time migration — sets isActive=true on all delivery users who don't have it
// Called automatically on server start via server.js
module.exports.runMigration = async () => {
  const User = require('../models/User');
  const result = await User.updateMany(
    { role: 'delivery', isActive: { $exists: false } },
    { $set: { isActive: true, isAvailable: true } }
  );
  if (result.modifiedCount > 0) {
    console.log(`✅ Migration: set isActive=true on ${result.modifiedCount} delivery user(s)`);
  }
};
