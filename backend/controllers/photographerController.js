const mongoose = require('mongoose');
const User = require('../models/User');
const Photographer = require('../models/Photographer');
const Booking = require('../models/Booking');
const { startOfDayUTC, isValidDate, isPastDate } = require('../utils/dateUtils');

const findOwnPhotographer = async (userId) => {
  return Photographer.findOne({ user: userId });
};

const datesMatch = (a, b) => startOfDayUTC(a).getTime() === startOfDayUTC(b).getTime();

const normalizeIncomingDates = (dates) => {
  if (!Array.isArray(dates)) {
    return { error: 'dates must be an array' };
  }

  const normalized = [];

  for (const item of dates) {
    if (!isValidDate(item)) {
      return { error: `Invalid date: ${item}` };
    }
    if (isPastDate(item)) {
      return { error: 'Past dates cannot be added to availability' };
    }
    const day = startOfDayUTC(item);
    const alreadyAdded = normalized.some((d) => d.getTime() === day.getTime());
    if (!alreadyAdded) {
      normalized.push(day);
    }
  }

  return { dates: normalized };
};

// POST /api/photographers — admin creates a photographer user + profile
const createPhotographer = async (req, res, next) => {
  try {
    const { name, email, password, specialty, pricePerSession } = req.body;

    if (!name || !email || !password || !specialty || pricePerSession === undefined) {
      return res.status(400).json({
        message: 'name, email, password, specialty and pricePerSession are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (Number(pricePerSession) < 0) {
      return res.status(400).json({ message: 'pricePerSession cannot be negative' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'photographer',
    });

    try {
      const photographer = await Photographer.create({
        user: user._id,
        specialty,
        pricePerSession,
      });

      const populated = await photographer.populate('user', 'name email role');

      res.status(201).json(populated);
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/photographers — optional ?search= by name or specialty
const getPhotographers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');

      filter = {
        $or: [
          { specialty: { $regex: search, $options: 'i' } },
          { user: { $in: matchingUsers.map((u) => u._id) } },
        ],
      };
    }

    const photographers = await Photographer.find(filter).populate('user', 'name email');
    res.status(200).json(photographers);
  } catch (error) {
    next(error);
  }
};

// GET /api/photographers/:id/availability — future free dates only
const getAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photographer id' });
    }

    const photographer = await Photographer.findById(id);
    if (!photographer) {
      return res.status(404).json({ message: 'Photographer not found' });
    }

    const today = startOfDayUTC(new Date());

    const confirmedBookings = await Booking.find({
      photographer: photographer._id,
      status: 'confirmed',
    }).select('sessionDate');

    const bookedTimes = new Set(
      confirmedBookings.map((b) => startOfDayUTC(b.sessionDate).getTime())
    );

    const available = photographer.availableDates
      .map((d) => startOfDayUTC(d))
      .filter((d) => d.getTime() >= today.getTime() && !bookedTimes.has(d.getTime()));

    res.status(200).json({ availableDates: available });
  } catch (error) {
    next(error);
  }
};

// GET /api/photographers/availability — photographer gets their own dates
const getMyAvailability = async (req, res, next) => {
  try {
    const photographer = await findOwnPhotographer(req.user.id);
    if (!photographer) {
      return res.status(404).json({ message: 'Photographer profile not found' });
    }
    res.status(200).json({ availableDates: photographer.availableDates });
  } catch (error) {
    next(error);
  }
};

// POST /api/photographers/availability — add dates (no duplicates, no past)
const addAvailability = async (req, res, next) => {
  try {
    const photographer = await findOwnPhotographer(req.user.id);
    if (!photographer) {
      return res.status(404).json({ message: 'Photographer profile not found' });
    }

    const parsed = normalizeIncomingDates(req.body.dates);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    parsed.dates.forEach((day) => {
      const exists = photographer.availableDates.some((d) => datesMatch(d, day));
      if (!exists) {
        photographer.availableDates.push(day);
      }
    });

    await photographer.save();
    res.status(200).json(photographer);
  } catch (error) {
    next(error);
  }
};

// PUT /api/photographers/availability — replace own dates
const replaceAvailability = async (req, res, next) => {
  try {
    const photographer = await findOwnPhotographer(req.user.id);
    if (!photographer) {
      return res.status(404).json({ message: 'Photographer profile not found' });
    }

    const parsed = normalizeIncomingDates(req.body.dates);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    photographer.availableDates = parsed.dates;
    await photographer.save();
    res.status(200).json(photographer);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/photographers/availability/:date — remove one date
const removeAvailability = async (req, res, next) => {
  try {
    const photographer = await findOwnPhotographer(req.user.id);
    if (!photographer) {
      return res.status(404).json({ message: 'Photographer profile not found' });
    }

    if (!isValidDate(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const day = startOfDayUTC(req.params.date);
    photographer.availableDates = photographer.availableDates.filter(
      (d) => !datesMatch(d, day)
    );

    await photographer.save();
    res.status(200).json(photographer);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/photographers/:id — admin removes a photographer
const deletePhotographer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photographer id' });
    }

    const photographer = await Photographer.findById(id);
    if (!photographer) {
      return res.status(404).json({ message: 'Photographer not found' });
    }

    // Clean up associated user and bookings
    await User.findByIdAndDelete(photographer.user);
    await Booking.deleteMany({ photographer: id });
    await Photographer.findByIdAndDelete(id);

    res.status(200).json({ message: 'Photographer removed from roster' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/photographers/:id — admin updates price/specialty
const updatePhotographer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photographer id' });
    }
    const { specialty, pricePerSession } = req.body;
    const updates = {};
    if (specialty !== undefined) updates.specialty = specialty;
    if (pricePerSession !== undefined) {
      if (Number(pricePerSession) < 0) return res.status(400).json({ message: 'Price cannot be negative' });
      updates.pricePerSession = Number(pricePerSession);
    }
    const photographer = await Photographer.findByIdAndUpdate(id, updates, { new: true }).populate('user', 'name email role');
    if (!photographer) return res.status(404).json({ message: 'Photographer not found' });
    res.status(200).json(photographer);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/photographers/me — photographer updates their own profile
const updateMyProfile = async (req, res, next) => {
  try {
    const photographer = await findOwnPhotographer(req.user.id);
    if (!photographer) return res.status(404).json({ message: 'Photographer profile not found' });
    const { specialty, pricePerSession } = req.body;
    if (specialty !== undefined) photographer.specialty = specialty;
    if (pricePerSession !== undefined) {
      if (Number(pricePerSession) < 0) return res.status(400).json({ message: 'Price cannot be negative' });
      photographer.pricePerSession = Number(pricePerSession);
    }
    await photographer.save();
    const populated = await photographer.populate('user', 'name email role');
    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/photographers/stats — admin gets studio-wide stats
const getStudioStats = async (req, res, next) => {
  try {
    const [totalPhotographers, allBookings, confirmedBookings] = await Promise.all([
      Photographer.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ status: 'confirmed' }).populate('photographer', 'pricePerSession'),
    ]);
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.photographer?.pricePerSession ?? 0), 0);
    res.status(200).json({
      totalPhotographers,
      totalBookings: allBookings,
      confirmedBookings: confirmedBookings.length,
      cancelledCount: allBookings - confirmedBookings.length,
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPhotographer,
  getPhotographers,
  getAvailability,
  getMyAvailability,
  addAvailability,
  replaceAvailability,
  removeAvailability,
  deletePhotographer,
  updatePhotographer,
  updateMyProfile,
  getStudioStats,
};
