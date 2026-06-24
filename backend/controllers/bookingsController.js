const pool = require('../config/db');

const createBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name, phone, email, customer_type = 'player',
      team_name, num_players, slot_id, notes,
    } = req.body;

    if (!name || !phone || !team_name || !num_players || !slot_id) {
      return res.status(400).json({
        success: false,
        message: 'name, phone, team_name, num_players, and slot_id are required',
      });
    }

    const players = parseInt(num_players);
    if (players < 6 || players > 22) {
      return res.status(400).json({
        success: false,
        message: 'num_players must be between 6 and 22',
      });
    }

    await client.query('BEGIN');

    const slotResult = await client.query(
      "SELECT * FROM slots WHERE id = $1 AND status = 'available'",
      [slot_id]
    );
    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Slot already booked or not available',
      });
    }
    const slot = slotResult.rows[0];

    const existingCustomer = await client.query(
      'SELECT * FROM customers WHERE phone = $1',
      [phone]
    );

    let customerId;
    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].id;
    } else {
      const customerResult = await client.query(
        'INSERT INTO customers (name, phone, email, customer_type) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, phone, email || null, customer_type]
      );
      customerId = customerResult.rows[0].id;
    }

    const totalAmount = parseFloat(slot.price);
    const bookingResult = await client.query(
      `INSERT INTO bookings
       (customer_id, slot_id, team_name, num_players, total_amount, booking_status, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', $6) RETURNING id`,
      [customerId, slot_id, team_name, players, totalAmount, notes || null]
    );
    const bookingId = bookingResult.rows[0].id;

    await client.query(
      "UPDATE slots SET status = 'booked' WHERE id = $1",
      [slot_id]
    );

    await client.query(
      `INSERT INTO occupancy (slot_id, date, is_occupied, revenue_generated)
       VALUES ($1, $2, TRUE, $3)`,
      [slot_id, slot.date, totalAmount]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: { bookingId, message: 'Booking confirmed!' },
      message: 'Booking created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
              c.name AS customer_name, c.phone, c.email,
              s.date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       ORDER BY b.booked_at DESC`
    );
    res.json({ success: true, data: result.rows, message: 'Bookings fetched successfully' });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT b.*,
              c.name AS customer_name, c.phone, c.email, c.customer_type,
              s.date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const payments = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 ORDER BY paid_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: { ...result.rows[0], payments: payments.rows },
      message: 'Booking fetched successfully',
    });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const result = await pool.query(
      `SELECT b.*,
              s.date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       WHERE c.phone = $1
       ORDER BY b.booked_at DESC`,
      [phone]
    );
    res.json({ success: true, data: result.rows, message: 'Bookings fetched for phone' });
  } catch (error) {
    console.error('getBookingsByPhone error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  const client = await pool.connect();
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

    const existing = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await client.query('BEGIN');

    if (status === 'cancelled') {
      await client.query(
        "UPDATE slots SET status = 'available' WHERE id = $1",
        [existing.rows[0].slot_id]
      );
      await client.query(
        'DELETE FROM occupancy WHERE slot_id = $1',
        [existing.rows[0].slot_id]
      );
    }

    await client.query(
      'UPDATE bookings SET booking_status = $1 WHERE id = $2',
      [status, id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { id, status },
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

const updatePaymentStatus = async (req, res) => {
  const client = await pool.connect();
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

    const existing = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const paymentAmount = amount || existing.rows[0].total_amount;

    await client.query('BEGIN');

    await client.query(
      'UPDATE bookings SET payment_status = $1 WHERE id = $2',
      [payment_status, id]
    );

    await client.query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status)
       VALUES ($1, $2, $3, $4)`,
      [id, paymentAmount, payment_method, payment_status]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { id, payment_status },
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updatePaymentStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
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
