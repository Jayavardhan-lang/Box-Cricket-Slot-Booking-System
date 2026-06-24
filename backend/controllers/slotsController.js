const pool = require('../config/db');

// Helper: convert HH:MM to total minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

const getAllSlots = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM slots ORDER BY date, start_time'
    );
    res.json({ success: true, data: result.rows, message: 'Slots fetched successfully' });
  } catch (error) {
    console.error('getAllSlots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSlotsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await pool.query(
      'SELECT * FROM slots WHERE date = $1 ORDER BY start_time',
      [date]
    );
    res.json({ success: true, data: result.rows, message: 'Slots fetched for date' });
  } catch (error) {
    console.error('getSlotsByDate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSlot = async (req, res) => {
  try {
    const { date, start_time, end_time, price, status = 'available' } = req.body;

    // Step 1: Required fields
    if (!date || !start_time || !end_time || !price) {
      return res.status(400).json({
        success: false,
        message: 'date, start_time, end_time, and price are required',
      });
    }

    // Step 2: End must be after start
    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Step 3: Minimum 30-minute duration
    const startMins = timeToMinutes(start_time);
    const endMins   = timeToMinutes(end_time);
    if ((endMins - startMins) < 30) {
      return res.status(400).json({
        success: false,
        message: 'Slot must be at least 30 minutes long',
      });
    }

    // Step 4: Overlap check (all 4 scenarios)
    const conflicts = await pool.query(
      `SELECT * FROM slots
       WHERE date = $1
         AND status != 'deleted'
         AND start_time < $2
         AND end_time   > $3
       ORDER BY start_time`,
      [date, end_time, start_time]
    );

    if (conflicts.rows.length > 0) {
      const conflictList = conflicts.rows.map(c => `${c.start_time}–${c.end_time}`).join(', ');
      const c = conflicts.rows[0];
      let conflictType;
      if (c.start_time === start_time && c.end_time === end_time) {
        conflictType = 'exact duplicate';
      } else if (start_time >= c.start_time && end_time <= c.end_time) {
        conflictType = 'falls inside existing slot';
      } else if (start_time <= c.start_time && end_time >= c.end_time) {
        conflictType = 'overlaps and covers existing slot';
      } else {
        conflictType = 'overlaps with existing slot';
      }

      const multiMsg = conflicts.rows.length > 1
        ? `This slot conflicts with ${conflicts.rows.length} existing slots: ${conflictList}`
        : `Cannot create slot — ${conflictType}`;

      return res.status(409).json({
        success: false,
        message: multiMsg,
        conflict: {
          count: conflicts.rows.length,
          conflictType,
          slots: conflicts.rows.map(c => ({
            id: c.id, date: c.date,
            start_time: c.start_time, end_time: c.end_time, status: c.status,
          })),
          existingSlotId: c.id,
          existingDate: c.date,
          existingStart: c.start_time,
          existingEnd: c.end_time,
          existingStatus: c.status,
        },
      });
    }

    // Step 5: Insert
    const result = await pool.query(
      `INSERT INTO slots (date, start_time, end_time, status, price)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [date, start_time, end_time, status, price]
    );

    res.status(201).json({
      success: true,
      data: { id: result.rows[0].id, date, start_time, end_time, price, status },
      message: 'Slot created successfully',
    });
  } catch (error) {
    console.error('createSlot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, price, start_time, end_time } = req.body;

    const existing = await pool.query('SELECT * FROM slots WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (status     !== undefined) { fields.push(`status = $${idx++}`);     values.push(status); }
    if (price      !== undefined) { fields.push(`price = $${idx++}`);      values.push(price); }
    if (start_time !== undefined) { fields.push(`start_time = $${idx++}`); values.push(start_time); }
    if (end_time   !== undefined) { fields.push(`end_time = $${idx++}`);   values.push(end_time); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.query(`UPDATE slots SET ${fields.join(', ')} WHERE id = $${idx}`, values);

    res.json({ success: true, data: { id }, message: 'Slot updated successfully' });
  } catch (error) {
    console.error('updateSlot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM slots WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    await pool.query('DELETE FROM slots WHERE id = $1', [id]);

    res.json({ success: true, data: { id }, message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('deleteSlot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSlots, getSlotsByDate, createSlot, updateSlot, deleteSlot };
