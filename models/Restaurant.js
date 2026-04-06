const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  isAvailable: { type: Boolean, default: true }
});

const restaurantSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  description: String,
  image: String,
  rating: { type: Number, default: 4.0 },
  deliveryTime: String,
  minOrder: Number,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  menu: [menuItemSchema],
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
