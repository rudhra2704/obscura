const mongoose = require('mongoose');
const Photographer = require('../models/Photographer');
const Booking = require('../models/Booking');
const { startOfDayUTC, isValidDate, isPastDate } = require('../utils/dateUtils');

const datesMatch = (a, b) => startOfDayUTC(a).getTime() === startOfDayUTC(b).getTime();

const populateBooking = (query) =>
  query
    .populate({
      path: 'photographer',
      populate: { path: 'user', select: 'name email' },
    })
    .populate('client', 'name email');

// POST /api/bookings — client books a session
const createBooking = async (req, res, next) => {
  try {
    const { photographerId, sessionDate } = req.body;

    if (!photographerId || !sessionDate) {
      return res.status(400).json({ message: 'photographerId and sessionDate are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(photographerId)) {
      return res.status(400).json({ message: 'Invalid photographerId' });
    }

    if (!isValidDate(sessionDate)) {
      return res.status(400).json({ message: 'sessionDate must be a valid date' });
    }

    if (isPastDate(sessionDate)) {
      return res.status(400).json({ message: 'sessionDate cannot be in the past' });
    }

    const day = startOfDayUTC(sessionDate);

    const photographer = await Photographer.findById(photographerId);
    if (!photographer) {
      return res.status(404).json({ message: 'Photographer not found' });
    }

    const isAvailable = photographer.availableDates.some((d) => datesMatch(d, day));
    if (!isAvailable) {
      return res.status(409).json({ message: 'Photographer not available on this date' });
    }

    const existing = await Booking.findOne({
      photographer: photographer._id,
      sessionDate: day,
      status: 'confirmed',
    });

    if (existing) {
      return res.status(409).json({ message: 'This date is already booked' });
    }

    const booking = await Booking.create({
      photographer: photographer._id,
      client: req.user.id,
      sessionDate: day,
      status: 'confirmed',
    });

    const populated = await populateBooking(Booking.findById(booking._id));
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This date is already booked' });
    }
    next(error);
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    let bookings;

    if (req.user.role === 'photographer') {
      const photographer = await Photographer.findOne({ user: req.user.id });
      if (!photographer) {
        return res.status(404).json({ message: 'Photographer profile not found' });
      }
      bookings = await populateBooking(Booking.find({ photographer: photographer._id }));
    } else {
      bookings = await populateBooking(Booking.find({ client: req.user.id }));
    }

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/cancel — client cancels their own booking
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const populated = await populateBooking(Booking.findById(booking._id));
    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
