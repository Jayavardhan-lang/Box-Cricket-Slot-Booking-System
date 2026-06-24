const pool = require('../config/db');

const getSummary = async (req, res) => {
  try {
    // TODAY's bookings
    const todayResult = await pool.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE DATE(booked_at) = CURRENT_DATE"
    );
    const today_bookings = parseInt(todayResult.rows[0].count);

    // MONTHLY revenue (paid bookings this calendar month)
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM bookings
       WHERE payment_status = 'paid'
         AND DATE_TRUNC('month', booked_at) = DATE_TRUNC('month', NOW())`
    );
    const monthly_revenue = parseFloat(revenueResult.rows[0].total);

    // AVAILABLE slots today
    const availResult = await pool.query(
      "SELECT COUNT(*) AS count FROM slots WHERE date = CURRENT_DATE AND status = 'available'"
    );
    const available_slots_today = parseInt(availResult.rows[0].count);

    // ACTIVE memberships
    const membResult = await pool.query(
      "SELECT COUNT(*) AS count FROM memberships WHERE status = 'active'"
    );
    const active_memberships = parseInt(membResult.rows[0].count);

    // UPCOMING tournaments
    const tourResult = await pool.query(
      "SELECT COUNT(*) AS count FROM tournaments WHERE status = 'upcoming'"
    );
    const upcoming_tournaments = parseInt(tourResult.rows[0].count);

    // TOTAL customers
    const custResult = await pool.query(
      "SELECT COUNT(*) AS count FROM customers"
    );
    const total_customers = parseInt(custResult.rows[0].count);

    // RECENT bookings (last 5)
    const recentResult = await pool.query(
      `SELECT b.id, b.team_name, b.booking_status, b.payment_status, b.booked_at,
              c.name AS customer_name, c.phone,
              s.date AS slot_date, s.start_time, s.end_time, s.price
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN slots s ON b.slot_id = s.id
       ORDER BY b.booked_at DESC
       LIMIT 5`
    );

    // WEEKLY revenue (last 7 days)
    const weeklyResult = await pool.query(
      `SELECT DATE(booked_at) AS day, COALESCE(SUM(total_amount), 0) AS revenue
       FROM bookings
       WHERE payment_status = 'paid'
         AND booked_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(booked_at)
       ORDER BY day`
    );

    res.json({
      success: true,
      data: {
        today_bookings,
        monthly_revenue,
        available_slots_today,
        active_memberships,
        upcoming_tournaments,
        total_customers,
        recent_bookings: recentResult.rows,
        weekly_revenue: weeklyResult.rows,
      },
      message: 'Dashboard summary fetched successfully',
    });
  } catch (error) {
    console.error('getSummary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSummary };
