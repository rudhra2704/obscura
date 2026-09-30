const express = require('express');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
