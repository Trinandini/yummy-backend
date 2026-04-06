const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: Number,
  deliveryAddress: String,
  status: {
    type: String,
    enum: ['placed', 'accepted_by_owner', 'assigned_delivery', 'out_for_delivery', 'delivered'],
    default: 'placed'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    message: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
