const mongoose = require('mongoose');

const photographerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
    },
    pricePerSession: {
      type: Number,
      required: [true, 'Price per session is required'],
      min: [0, 'Price cannot be negative'],
    },
    availableDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photographer', photographerSchema);
