const pool = require('../config/db');

const createOrFindCustomer = async (req, res) => {
  try {
    const { name, phone, email, customer_type = 'player' } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }

    const existing = await pool.query(
      'SELECT * FROM customers WHERE phone = $1',
      [phone]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        data: existing.rows[0],
        message: 'Existing customer found',
      });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required for new customer' });
    }

    const result = await pool.query(
      'INSERT INTO customers (name, phone, email, customer_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, phone, email || null, customer_type]
    );

    const newCustomer = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      data: newCustomer.rows[0],
      message: 'Customer created successfully',
    });
  } catch (error) {
    console.error('createOrFindCustomer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows, message: 'Customers fetched successfully' });
  } catch (error) {
    console.error('getAllCustomers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: result.rows[0], message: 'Customer fetched successfully' });
  } catch (error) {
    console.error('getCustomerById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrFindCustomer, getAllCustomers, getCustomerById };
