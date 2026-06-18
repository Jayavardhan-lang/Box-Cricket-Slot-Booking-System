const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
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

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allow all localhost origins (any port) in dev + production URL
const PRODUCTION_URL = process.env.FRONTEND_URL;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow any localhost port (handles Vite using 5173, 5174, 5175, etc.)
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) ||
                        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
    if (isLocalhost) return callback(null, true);

    // Allow production domain
    if (PRODUCTION_URL && origin === PRODUCTION_URL) return callback(null, true);

    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRouter        = require('./routes/auth');
const slotsRouter       = require('./routes/slots');
const bookingsRouter    = require('./routes/bookings');
const customersRouter   = require('./routes/customers');
const tournamentsRouter = require('./routes/tournaments');
const membershipsRouter = require('./routes/memberships');
const feedbackRouter    = require('./routes/feedback');
const dashboardRouter   = require('./routes/dashboard');
const fixturesRouter    = require('./routes/fixtures');

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
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
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
}
