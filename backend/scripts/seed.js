// backend/scripts/seed.js
const fs = require('fs');
const path = require('path');
const { initializeDatabase, query } = require('../src/core/db/pool');

(async () => {
  try {
    await initializeDatabase();
    const sqlPath = path.resolve(__dirname, '..', '_sql', 'seed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running seed SQL...');
    await query(sql);

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();