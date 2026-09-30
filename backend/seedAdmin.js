require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@studio.com';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    await User.create({
      name: 'Studio Admin',
      email,
      password: 'admin123',
      role: 'admin',
    });

    console.log('Admin created: admin@studio.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
