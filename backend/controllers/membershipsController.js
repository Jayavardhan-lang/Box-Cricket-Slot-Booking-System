const pool = require('../config/db');

const PLAN_PRICES = {
  basic: 999,
  premium: 1999,
  corporate: 4999,
};

const createMembership = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { name, phone, email, customer_type = 'player', plan_name = 'basic', start_date } = req.body;

    if (!name || !phone || !plan_name) {
      return res.status(400).json({
        success: false,
        message: 'name, phone, and plan_name are required',
      });
    }

    const validPlans = ['basic', 'premium', 'corporate'];
    if (!validPlans.includes(plan_name)) {
      return res.status(400).json({
        success: false,
        message: `plan_name must be one of: ${validPlans.join(', ')}`,
      });
    }

    await conn.beginTransaction();

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

    const membershipStart = start_date || new Date().toISOString().split('T')[0];
    const endDateObj = new Date(membershipStart);
    endDateObj.setDate(endDateObj.getDate() + 30);
    const membershipEnd = endDateObj.toISOString().split('T')[0];

    const amount = PLAN_PRICES[plan_name];

    const [result] = await conn.query(
      `INSERT INTO memberships (customer_id, plan_name, start_date, end_date, status, amount_paid)
       VALUES (?, ?, ?, ?, 'active', ?)`,
      [customerId, plan_name, membershipStart, membershipEnd, amount]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      data: {
        membershipId: result.insertId,
        customerId,
        plan_name,
        start_date: membershipStart,
        end_date: membershipEnd,
        amount_paid: amount,
      },
      message: 'Membership created successfully',
    });
  } catch (error) {
    await conn.rollback();
    console.error('createMembership error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

const getAllMemberships = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, c.name, c.phone, c.email, c.customer_type
       FROM memberships m
       JOIN customers c ON m.customer_id = c.id
       ORDER BY m.start_date DESC`
    );
    res.json({ success: true, data: rows, message: 'Memberships fetched successfully' });
  } catch (error) {
    console.error('getAllMemberships error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMembershipById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT m.*, c.name, c.phone, c.email, c.customer_type
       FROM memberships m
       JOIN customers c ON m.customer_id = c.id
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    res.json({ success: true, data: rows[0], message: 'Membership fetched successfully' });
  } catch (error) {
    console.error('getMembershipById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'expired'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const [existing] = await pool.query('SELECT * FROM memberships WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    await pool.query('UPDATE memberships SET status = ? WHERE id = ?', [status, id]);

    res.json({ success: true, data: { id, status }, message: 'Membership updated successfully' });
  } catch (error) {
    console.error('updateMembership error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createMembership, getAllMemberships, getMembershipById, updateMembership };
