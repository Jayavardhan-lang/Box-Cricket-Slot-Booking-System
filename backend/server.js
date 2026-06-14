const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ─── Process-level Error Guards ───────────────────────────────────────────────
// Prevent DB connection failures from crashing the server process
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Rejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err.message);
});

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Route Imports ────────────────────────────────────────────────────────────
const slotsRouter       = require('./routes/slots');
const bookingsRouter    = require('./routes/bookings');
const customersRouter   = require('./routes/customers');
const tournamentsRouter = require('./routes/tournaments');
const membershipsRouter = require('./routes/memberships');
const feedbackRouter    = require('./routes/feedback');
const dashboardRouter   = require('./routes/dashboard');
const fixturesRouter    = require('./routes/fixtures');

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/slots',        slotsRouter);
app.use('/api/bookings',     bookingsRouter);
app.use('/api/customers',    customersRouter);
app.use('/api/tournaments',  tournamentsRouter);
app.use('/api/memberships',  membershipsRouter);
app.use('/api/feedback',     feedbackRouter);
app.use('/api/dashboard',    dashboardRouter);
app.use('/api/fixtures',     fixturesRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'Eagle Box Cricket API Running' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    console.log(`🚀 Eagle Box Cricket API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
}
