const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, logout, verifySession } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ─── Rate Limiter: max 5 failed login attempts per 15 minutes per IP ──────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 5,
  skipSuccessfulRequests: true, // only count failed attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    retryAfter: 15,
  },
  handler: (req, res, next, options) => {
    console.warn(`⚠️  Rate limit hit on /api/auth/login from IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/auth/login  — rate-limited, no auth required
router.post('/login', loginLimiter, login);

// POST /api/auth/logout — auth required (so stale tokens can't spam logout)
router.post('/logout', verifyToken, logout);

// GET  /api/auth/verify — auth required; used by frontend to validate stored token on load
router.get('/verify', verifyToken, verifySession);

module.exports = router;
