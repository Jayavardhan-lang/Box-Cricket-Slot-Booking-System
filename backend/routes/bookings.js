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

router.post('/', createBooking);

router.get('/', getAllBookings);

router.get('/phone/:phone', getBookingsByPhone);

router.get('/:id', getBookingById);

router.put('/:id/status', updateBookingStatus);

router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
