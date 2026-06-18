/**
 * Auth Controller — Single Admin Authentication
 *
 * Credentials are stored exclusively in environment variables:
 *   ADMIN_USERNAME      — plain text username
 *   ADMIN_PASSWORD_HASH — bcrypt hash of the password
 *   JWT_SECRET          — random 64-char secret for signing tokens
 *
 * NEVER expose credentials in frontend code or logs.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── Helper: send a generic auth failure (never reveal which field is wrong) ──
function authFail(res) {
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
async function login(req, res) {
  const { username, password } = req.body;

  // Basic presence check
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  // Validate env vars are configured
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
    console.error('❌ Auth env vars not configured (ADMIN_USERNAME / ADMIN_PASSWORD_HASH / JWT_SECRET)');
    return res.status(500).json({ success: false, message: 'Server authentication not configured' });
  }

  // Username check (constant-time string comparison via bcrypt timing parity)
  if (username !== process.env.ADMIN_USERNAME) {
    // Perform a dummy bcrypt compare to prevent timing attacks that could
    // reveal whether the username or password was wrong.
    await bcrypt.compare(password, '$2a$12$dummyhashfortimingprotection..........................');
    return authFail(res);
  }

  // Password check
  const passwordValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!passwordValid) {
    return authFail(res);
  }

  // Issue JWT — 24-hour expiry
  const token = jwt.sign(
    { username: process.env.ADMIN_USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    username: process.env.ADMIN_USERNAME,
    expiresIn: 86400, // seconds (24h)
  });
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT is stateless — actual token invalidation happens client-side.
// This endpoint exists for completeness and future server-side blacklist support.
function logout(req, res) {
  return res.json({ success: true, message: 'Logged out successfully' });
}

// ─── GET /api/auth/verify ─────────────────────────────────────────────────────
// Called by the frontend on app load to check if the stored token is still valid.
function verifySession(req, res) {
  // req.admin is populated by the verifyToken middleware
  return res.json({
    success: true,
    username: req.admin.username,
    message: 'Token is valid',
  });
}

module.exports = { login, logout, verifySession };
