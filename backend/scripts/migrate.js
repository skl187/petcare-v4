// backend/scripts/migrate.js
const fs = require('fs');
const path = require('path');
const { initializeDatabase, query } = require('../src/core/db/pool');

(async () => {
  try {
    await initializeDatabase();
    const sqlPath = path.resolve(__dirname, '..', '_sql', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running schema SQL...');
    // Execute as a single query - the file contains DDL and DO blocks
    await query(sql);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();