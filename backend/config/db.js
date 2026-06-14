const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Prevent fatal errors from crashing the process
  connectTimeout: 10000,
});

// Test connection on startup (non-fatal — only logs)
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL Database connected successfully');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('   → Update your .env file with real Aiven MySQL credentials');
  });

module.exports = pool;
