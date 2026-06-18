const pool = require('../config/db');

const createFeedback = async (req, res) => {
  try {
    const { customer_id, booking_id, rating, comment } = req.body;

    if (!customer_id || !booking_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'customer_id, booking_id, and rating are required',
      });
    }

    const parsedRating = parseInt(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'rating must be between 1 and 5',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO feedback (customer_id, booking_id, rating, comment) VALUES (?, ?, ?, ?)',
      [customer_id, booking_id, parsedRating, comment || null]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId },
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('createFeedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, c.name AS customer_name, c.phone
       FROM feedback f
       JOIN customers c ON f.customer_id = c.id
       ORDER BY f.submitted_at DESC`
    );

    const [avgResult] = await pool.query(
      'SELECT ROUND(AVG(rating), 1) AS average_rating FROM feedback'
    );

    const average_rating = avgResult[0].average_rating || 0;

    res.json({
      success: true,
      data: { feedback: rows, average_rating },
      message: 'Feedback fetched successfully',
    });
  } catch (error) {
    console.error('getAllFeedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createFeedback, getAllFeedback };
