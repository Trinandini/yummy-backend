const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/delivery', require('./routes/delivery'));

// Connect to MongoDB, then run migration and start server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // Auto-migrate: set isActive=true on delivery users missing the field
    // This fixes users registered before the isActive field was introduced
    const User = require('./models/User');
    const migrated = await User.updateMany(
      { role: 'delivery', isActive: { $exists: false } },
      { $set: { isActive: true, isAvailable: true } }
    );
    if (migrated.modifiedCount > 0) {
      console.log(`🔧 Auto-migrated ${migrated.modifiedCount} delivery user(s) → isActive: true`);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB Error:', err));
