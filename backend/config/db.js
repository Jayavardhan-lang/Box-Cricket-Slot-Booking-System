const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Required for Supabase (SSL-enforced)
  ssl: process.env.DB_SSL === 'false'
    ? false
    : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
});

// Test connection + auto-initialize schema on startup
async function initializeDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ PostgreSQL Database connected successfully');

    // Check if tables already exist
    const { rows } = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'customers'`
    );

    if (rows.length > 0) {
      console.log('✨ Database tables already exist. Skipping schema initialization.');
      return;
    }

    console.log('🔄 Database is empty. Auto-initializing schema from schema.sql...');

    const fs   = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  schema.sql not found at', schemaPath);
      return;
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sqlContent);
    console.log('✅ Database schema and seed data initialized successfully!');

  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  } finally {
    if (client) client.release();
  }
}

initializeDatabase();

module.exports = pool;
