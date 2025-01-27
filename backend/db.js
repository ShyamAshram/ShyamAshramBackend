const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://Juan:<db_password>@yapp.ura5p.mongodb.net/?retryWrites=true&w=majority&appName=YAPP/Yapp";
    await mongoose.connect(uri, {
     
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); 
  }

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('MongoDB connection open');
  });
};

module.exports = connectDB;
