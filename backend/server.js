require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const photographerRoutes = require('./routes/photographerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/photographers', photographerRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
