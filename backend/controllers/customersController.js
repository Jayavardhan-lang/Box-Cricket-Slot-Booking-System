const pool = require('../config/db');

// ─── CREATE OR FIND CUSTOMER ───────────────────────────────────────────────────
const createOrFindCustomer = async (req, res) => {
  try {
    const { name, phone, email, customer_type = 'player' } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }

    // Check if customer exists by phone
    const [existing] = await pool.query(
      'SELECT * FROM customers WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        data: existing[0],
        message: 'Existing customer found',
      });
    }

    // Create new customer
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required for new customer' });
    }

    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, email, customer_type) VALUES (?, ?, ?, ?)',
      [name, phone, email || null, customer_type]
    );

    const [newCustomer] = await pool.query(
      'SELECT * FROM customers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newCustomer[0],
      message: 'Customer created successfully',
    });
  } catch (error) {
    console.error('createOrFindCustomer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL CUSTOMERS ─────────────────────────────────────────────────────────
const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows, message: 'Customers fetched successfully' });
  } catch (error) {
    console.error('getAllCustomers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET CUSTOMER BY ID ────────────────────────────────────────────────────────
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: rows[0], message: 'Customer fetched successfully' });
  } catch (error) {
    console.error('getCustomerById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrFindCustomer, getAllCustomers, getCustomerById };
