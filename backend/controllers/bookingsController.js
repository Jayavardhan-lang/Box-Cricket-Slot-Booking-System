const pool = require('../config/db');

// ─── CREATE BOOKING ────────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      name, phone, email, customer_type = 'player',
      team_name, num_players, slot_id, notes,
    } = req.body;

    // 1. Validate required fields
    if (!name || !phone || !team_name || !num_players || !slot_id) {
      return res.status(400).json({
        success: false,
        message: 'name, phone, team_name, num_players, and slot_id are required',
      });
    }

    // 2. Validate num_players
    const players = parseInt(num_players);
    if (players < 6 || players > 22) {
      return res.status(400).json({
        success: false,
        message: 'num_players must be between 6 and 22',
      });
    }

    await conn.beginTransaction();

    // 3. Check slot availability
    const [slotRows] = await conn.query(
      "SELECT * FROM slots WHERE id = ? AND status = 'available'",
      [slot_id]
    );
    if (slotRows.length === 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'Slot already booked or not available',
      });
    }
    const slot = slotRows[0];

    // 4. Create or find customer
    const [existingCustomer] = await conn.query(
      'SELECT * FROM customers WHERE phone = ?',
      [phone]
    );

    let customerId;
    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
    } else {
      const [customerResult] = await conn.query(
        'INSERT INTO customers (name, phone, email, customer_type) VALUES (?, ?, ?, ?)',
        [name, phone, email || null, customer_type]
      );
      customerId = customerResult.insertId;
    }

    // 5. Create booking
    const totalAmount = parseFloat(slot.price);
    const [bookingResult] = await conn.query(
      `INSERT INTO bookings 
       (customer_id, slot_id, team_name, num_players, total_amount, booking_status, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
      [customerId, slot_id, team_name, players, totalAmount, notes || null]
    );
    const bookingId = bookingResult.insertId;

    // 6. Mark slot as booked
    await conn.query(
      "UPDATE slots SET status = 'booked' WHERE id = ?",
      [slot_id]
    );

    // 7. Create occupancy record
    await conn.query(
      `INSERT INTO occupancy (slot_id, date, is_occupied, revenue_generated)
       VALUES (?, ?, TRUE, ?)`,
      [slot_id, slot.date, totalAmount]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      data: { bookingId, message: 'Booking confirmed!' },
      message: 'Booking created successfully',
    });
  } catch (error) {
    await conn.rollback();
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

// ─── GET ALL BOOKINGS ──────────────────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, 
              c.name AS customer_name, c.phone, c.email,
              s.date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       ORDER BY b.booked_at DESC`
    );
    res.json({ success: true, data: rows, message: 'Bookings fetched successfully' });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET BOOKING BY ID ─────────────────────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT b.*, 
              c.name AS customer_name, c.phone, c.email, c.customer_type,
              s.date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Also get payment records for this booking
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY paid_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: { ...rows[0], payments },
      message: 'Booking fetched successfully',
    });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET BOOKINGS BY PHONE ─────────────────────────────────────────────────────
const getBookingsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const [rows] = await pool.query(
      `SELECT b.*, 
              s.date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       WHERE c.phone = ?
       ORDER BY b.booked_at DESC`,
      [phone]
    );

    res.json({ success: true, data: rows, message: 'Bookings fetched for phone' });
  } catch (error) {
    console.error('getBookingsByPhone error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE BOOKING STATUS ─────────────────────────────────────────────────────
const updateBookingStatus = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'cancelled', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Check booking exists
    const [existing] = await conn.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await conn.beginTransaction();

    // If cancelling, free the slot
    if (status === 'cancelled') {
      await conn.query(
        "UPDATE slots SET status = 'available' WHERE id = ?",
        [existing[0].slot_id]
      );
      // Remove occupancy record
      await conn.query(
        'DELETE FROM occupancy WHERE slot_id = ?',
        [existing[0].slot_id]
      );
    }

    await conn.query(
      'UPDATE bookings SET booking_status = ? WHERE id = ?',
      [status, id]
    );

    await conn.commit();

    res.json({
      success: true,
      data: { id, status },
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    await conn.rollback();
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

// ─── UPDATE PAYMENT STATUS ─────────────────────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { payment_status, payment_method = 'cash', amount } = req.body;

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: `payment_status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const [existing] = await conn.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const paymentAmount = amount || existing[0].total_amount;

    await conn.beginTransaction();

    // Update booking payment status
    await conn.query(
      'UPDATE bookings SET payment_status = ? WHERE id = ?',
      [payment_status, id]
    );

    // Insert payment record
    await conn.query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?)`,
      [id, paymentAmount, payment_method, payment_status]
    );

    await conn.commit();

    res.json({
      success: true,
      data: { id, payment_status },
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    await conn.rollback();
    console.error('updatePaymentStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByPhone,
  updateBookingStatus,
  updatePaymentStatus,
};
