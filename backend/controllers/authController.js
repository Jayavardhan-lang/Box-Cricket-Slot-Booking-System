
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function authFail(res) {
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
    console.error('❌ Auth env vars not configured (ADMIN_USERNAME / ADMIN_PASSWORD_HASH / JWT_SECRET)');
    return res.status(500).json({ success: false, message: 'Server authentication not configured' });
  }

  if (username !== process.env.ADMIN_USERNAME) {

    await bcrypt.compare(password, '$2a$12$dummyhashfortimingprotection..........................');
    return authFail(res);
  }

  const passwordValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!passwordValid) {
    return authFail(res);
  }

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
    expiresIn: 86400, 
  });
}

function logout(req, res) {
  return res.json({ success: true, message: 'Logged out successfully' });
}

function verifySession(req, res) {

  return res.json({
    success: true,
    username: req.admin.username,
    message: 'Token is valid',
  });
}

module.exports = { login, logout, verifySession };
