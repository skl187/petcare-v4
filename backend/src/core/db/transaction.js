// src/core/db/transaction.js
const { getConnection } = require('./pool');

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

module.exports = { transaction };