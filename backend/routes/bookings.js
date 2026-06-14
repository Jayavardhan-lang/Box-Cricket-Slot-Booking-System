const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByPhone,
  updateBookingStatus,
  updatePaymentStatus,
} = require('../controllers/bookingsController');

// POST   /api/bookings                   → create booking
router.post('/', createBooking);

// GET    /api/bookings                   → get all bookings
router.get('/', getAllBookings);

// GET    /api/bookings/phone/:phone      → get bookings by customer phone
router.get('/phone/:phone', getBookingsByPhone);

// GET    /api/bookings/:id               → get single booking
router.get('/:id', getBookingById);

// PUT    /api/bookings/:id/status        → update booking status
router.put('/:id/status', updateBookingStatus);

// PUT    /api/bookings/:id/payment       → update payment status
router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
