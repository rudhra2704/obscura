const mongoose = require('mongoose');

// Connect to MongoDB Atlas using MONGO_URI from .env
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Missing MONGO_URI. Copy .env.example to .env and paste your MongoDB Atlas connection string.');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
