// backend/scripts/migrate.js
const fs = require('fs');
const path = require('path');
const { initializeDatabase, query } = require('../src/core/db/pool');

(async () => {
  try {
    await initializeDatabase();

    // support both backend/_sql/schema.sql and repo-root /.sql/schema.sql
    const candidatePaths = [
      path.resolve(__dirname, '..', '_sql', 'schema.sql'),
      path.resolve(__dirname, '..', '..', '.sql', 'schema.sql'),
      path.resolve(__dirname, '..', '..', '_sql', 'schema.sql')
    ];

    let sqlPath = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) { sqlPath = p; break; }
    }
    if (!sqlPath) throw new Error('schema.sql not found in backend/_sql or repo .sql folder');

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running schema SQL from', sqlPath);
    // Execute as a single query - the file contains DDL and DO blocks
    await query(sql);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();