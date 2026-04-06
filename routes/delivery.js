const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorizeRoles } = require('../middleware/auth');

// Delivery person: get their assigned orders
router.get('/my-deliveries', protect, authorizeRoles('delivery'), async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPersonId: req.user._id })
      .populate('restaurantId', 'name image cuisine')
      .populate('customerId', 'name phone address')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delivery: start delivery (picked up from restaurant)
router.put('/start/:id', protect, authorizeRoles('delivery'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'out_for_delivery';
    order.statusHistory.push({ status: 'out_for_delivery', message: 'Delivery person picked up your order — on the way!' });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delivery: mark as delivered
router.put('/delivered/:id', protect, authorizeRoles('delivery'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'delivered';
    order.statusHistory.push({ status: 'delivered', message: '🎉 Your order has been delivered to your doorstep!' });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
