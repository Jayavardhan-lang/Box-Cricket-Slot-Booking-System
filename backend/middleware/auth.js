/**
 * JWT Authentication Middleware
 * Verifies Bearer token on protected admin API routes.
 *
 * Usage: router.get('/protected', verifyToken, handler)
 */
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { username, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        expired: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
}

module.exports = { verifyToken };
