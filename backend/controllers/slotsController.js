const pool = require('../config/db');

// ─── GET ALL SLOTS ─────────────────────────────────────────────────────────────
const getAllSlots = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM slots ORDER BY date, start_time'
    );
    res.json({ success: true, data: rows, message: 'Slots fetched successfully' });
  } catch (error) {
    console.error('getAllSlots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SLOTS BY DATE ─────────────────────────────────────────────────────────
const getSlotsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const [rows] = await pool.query(
      'SELECT * FROM slots WHERE date = ? ORDER BY start_time',
      [date]
    );
    res.json({ success: true, data: rows, message: 'Slots fetched for date' });
  } catch (error) {
    console.error('getSlotsByDate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE SLOT ───────────────────────────────────────────────────────────────
const createSlot = async (req, res) => {
  try {
    const { date, start_time, end_time, price, status = 'available' } = req.body;

    if (!date || !start_time || !end_time || !price) {
      return res.status(400).json({
        success: false,
        message: 'date, start_time, end_time, and price are required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO slots (date, start_time, end_time, status, price) VALUES (?, ?, ?, ?, ?)',
      [date, start_time, end_time, status, price]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId },
      message: 'Slot created successfully',
    });
  } catch (error) {
    console.error('createSlot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE SLOT ───────────────────────────────────────────────────────────────
const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, price, start_time, end_time } = req.body;

    // Check slot exists
    const [existing] = await pool.query('SELECT * FROM slots WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    const fields = [];
    const values = [];

    if (status !== undefined)     { fields.push('status = ?');     values.push(status); }
    if (price !== undefined)      { fields.push('price = ?');      values.push(price); }
    if (start_time !== undefined) { fields.push('start_time = ?'); values.push(start_time); }
    if (end_time !== undefined)   { fields.push('end_time = ?');   values.push(end_time); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.query(`UPDATE slots SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, data: { id }, message: 'Slot updated successfully' });
  } catch (error) {
    console.error('updateSlot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE SLOT ───────────────────────────────────────────────────────────────
const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM slots WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    await pool.query('DELETE FROM slots WHERE id = ?', [id]);

    res.json({ success: true, data: { id }, message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('deleteSlot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSlots, getSlotsByDate, createSlot, updateSlot, deleteSlot };
