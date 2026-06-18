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

  connectTimeout: 10000,
});

const fs = require('fs');
const path = require('path');

async function initializeDatabase(pool) {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');

    const [tables] = await conn.query("SHOW TABLES LIKE 'customers'");
    if (tables.length > 0) {
      console.log('✨ Database tables already exist. Skipping schema initialization.');
      return;
    }

    console.log('🔄 Database is empty. Auto-initializing schema from schema.sql...');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️ schema.sql not found at', schemaPath);
      return;
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {

        const clean = stmt.replace(/--.*$/gm, '').trim();
        return clean.length > 0;
      });

    for (let statement of statements) {

      const cleanStmt = statement
        .split('\n')
        .map(line => line.replace(/--.*$/, '').trim())
        .filter(line => line.length > 0)
        .join(' ')
        .trim();

      if (!cleanStmt) continue;

      if (cleanStmt.toUpperCase().startsWith('CREATE DATABASE') || cleanStmt.toUpperCase().startsWith('USE ')) {
        console.log(`ℹ️ Skipping database creation/selection statement: ${cleanStmt}`);
        continue;
      }

      try {
        await conn.query(cleanStmt);
      } catch (err) {
        console.error(`❌ Error executing SQL statement: ${cleanStmt.substring(0, 100)}...`);
        console.error(`   Details: ${err.message}`);
        throw err;
      }
    }

    console.log('✅ Database schema and seed data initialized successfully!');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  } finally {
    if (conn) conn.release();
  }
}

pool.getConnection()
  .then((conn) => {
    conn.release();
    initializeDatabase(pool);
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('   → Make sure your local or Railway MySQL server is running and .env is correct.');
  });

module.exports = pool;
