const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI ;
    await mongoose.connect(uri);

    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }

  const db = mongoose.connection;
  db.on('error', err => console.error('❌ MongoDB connection error:', err));
  db.once('open', () => console.log('🔗 MongoDB connection open'));
};

module.exports = connectDB;
