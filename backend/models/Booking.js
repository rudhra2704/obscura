const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photographer',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Confirmed bookings cannot share the same photographer + date.
// Cancelled bookings do not count, so the date can be booked again.
bookingSchema.index(
  { photographer: 1, sessionDate: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);

module.exports = mongoose.model('Booking', bookingSchema);
