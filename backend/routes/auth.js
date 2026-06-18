const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, logout, verifySession } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  skipSuccessfulRequests: true, 
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

router.post('/login', loginLimiter, login);

router.post('/logout', verifyToken, logout);

router.get('/verify', verifyToken, verifySession);

module.exports = router;
