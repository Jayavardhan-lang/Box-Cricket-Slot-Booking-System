const pool = require('../config/db');

// ─── GET DASHBOARD SUMMARY ─────────────────────────────────────────────────────
const getSummary = async (req, res) => {
  try {
    // 1. Today's bookings count
    const [[{ count: today_bookings }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE DATE(booked_at) = CURDATE()"
    );

    // 2. Monthly revenue (paid bookings only)
    const [[{ total: monthly_revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total 
       FROM bookings 
       WHERE payment_status = 'paid'
         AND MONTH(booked_at) = MONTH(NOW())
         AND YEAR(booked_at) = YEAR(NOW())`
    );

    // 3. Available slots today
    const [[{ count: available_slots_today }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM slots WHERE date = CURDATE() AND status = 'available'"
    );

    // 4. Active memberships
    const [[{ count: active_memberships }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM memberships WHERE status = 'active'"
    );

    // 5. Upcoming tournaments
    const [[{ count: upcoming_tournaments }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM tournaments WHERE status = 'upcoming'"
    );

    // 6. Total customers
    const [[{ count: total_customers }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM customers"
    );

    // 7. Recent bookings (last 5)
    const [recent_bookings] = await pool.query(
      `SELECT b.id, b.team_name, b.booking_status, b.payment_status, b.booked_at,
              c.name AS customer_name, c.phone,
              s.date AS slot_date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       ORDER BY b.booked_at DESC
       LIMIT 5`
    );

    // 8. Weekly revenue (last 7 days by day)
    const [weekly_revenue] = await pool.query(
      `SELECT DATE(booked_at) AS day, COALESCE(SUM(total_amount), 0) AS revenue
       FROM bookings
       WHERE payment_status = 'paid'
         AND booked_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(booked_at)
       ORDER BY day`
    );

    res.json({
      success: true,
      data: {
        today_bookings,
        monthly_revenue: parseFloat(monthly_revenue),
        available_slots_today,
        active_memberships,
        upcoming_tournaments,
        total_customers,
        recent_bookings,
        weekly_revenue,
      },
      message: 'Dashboard summary fetched successfully',
    });
  } catch (error) {
    console.error('getSummary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSummary };
