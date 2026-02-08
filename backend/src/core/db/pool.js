const { Pool } = require('pg');
const { DATABASE_URL } = require('../../config/env');

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

/**
 * Initialize database connection and verify connectivity
 */
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Database connection failed:', err);
    throw err;
  }
};

/**
 * Execute a query with optional parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a connection from the pool
 * @returns {Promise} Client connection
 */
const getConnection = () => pool.connect();

/**
 * Execute a callback within a database transaction
 * @param {Function} callback - Function that receives client and returns a promise
 * @returns {Promise} Result from callback
 */
const transaction = async (callback) => {
  const client = await getConnection();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initializeDatabase,
  query,
  getConnection,
  transaction,
};