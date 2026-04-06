const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

// ── Helper: active delivery query ──────────────────────────────────
// Matches users who are delivery role AND whose isActive is NOT false
// (covers: isActive=true, isActive=undefined — i.e. all except explicitly removed)
const activeDeliveryQuery = { role: 'delivery', isActive: { $ne: false } };

// Customer: place order
router.post('/place', protect, authorizeRoles('customer'), async (req, res) => {
  try {
    const { restaurantId, items, totalAmount, deliveryAddress } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const owner = await User.findOne({ role: 'owner' });
    const order = await Order.create({
      customerId: req.user._id, restaurantId,
      ownerId: owner ? owner._id : null,
      items, totalAmount, deliveryAddress,
      status: 'placed',
      statusHistory: [{ status: 'placed', message: 'Order placed by customer' }]
    });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Customer: get their orders
router.get('/my-orders', protect, authorizeRoles('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('restaurantId', 'name image cuisine')
      .populate('deliveryPersonId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: get ALL orders
router.get('/restaurant-orders', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('customerId', 'name phone address')
      .populate('restaurantId', 'name image cuisine')
      .populate('deliveryPersonId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: accept new order & assign delivery
router.put('/accept/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    if (!deliveryPersonId) return res.status(400).json({ message: 'Please select a delivery person' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'assigned_delivery';
    order.deliveryPersonId = deliveryPersonId;
    order.statusHistory.push({ status: 'accepted_by_owner', message: 'Order accepted by restaurant' });
    order.statusHistory.push({ status: 'assigned_delivery', message: 'Delivery person assigned' });
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: emergency reassign active order
router.put('/reassign/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const { deliveryPersonId, reason } = req.body;
    if (!deliveryPersonId) return res.status(400).json({ message: 'Please select a delivery person' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'delivered') return res.status(400).json({ message: 'Cannot reassign a delivered order' });
    const newDP = await User.findById(deliveryPersonId);
    order.deliveryPersonId = deliveryPersonId;
    order.status = 'assigned_delivery';
    order.statusHistory.push({
      status: 'assigned_delivery',
      message: `⚡ Emergency reassigned to ${newDP?.name || 'new rider'}${reason ? ` — ${reason}` : ''}`
    });
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: get ACTIVE delivery persons for dropdown
// KEY FIX: use $ne: false instead of === true so users without isActive field are included
router.get('/delivery-persons', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const persons = await User.find(activeDeliveryQuery)
      .select('-password')
      .sort({ createdAt: 1 });
    res.json(persons);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: get ALL delivery persons including removed (for team management tab)
router.get('/all-delivery-persons', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const persons = await User.find({ role: 'delivery' })
      .select('-password')
      .sort({ isActive: -1, createdAt: 1 });
    res.json(persons);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name image cuisine')
      .populate('customerId', 'name phone address')
      .populate('deliveryPersonId', 'name phone');
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
