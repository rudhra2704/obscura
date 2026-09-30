const express = require('express');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
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
} = require('../controllers/photographerController');

const router = express.Router();

// Stats (admin only) — must come before /:id routes
router.get('/stats', protect, authorizeRoles('admin'), getStudioStats);

// Self-service routes for logged-in photographer
router.get('/availability', protect, authorizeRoles('photographer'), getMyAvailability);
router.patch('/me', protect, authorizeRoles('photographer'), updateMyProfile);
router.post('/availability', protect, authorizeRoles('photographer'), addAvailability);
router.put('/availability', protect, authorizeRoles('photographer'), replaceAvailability);
router.delete('/availability/:date', protect, authorizeRoles('photographer'), removeAvailability);

// Admin & public routes
router.post('/', protect, authorizeRoles('admin'), createPhotographer);
router.get('/', protect, getPhotographers);
router.get('/:id/availability', protect, getAvailability);
router.patch('/:id', protect, authorizeRoles('admin'), updatePhotographer);
router.delete('/:id', protect, authorizeRoles('admin'), deletePhotographer);

module.exports = router;
