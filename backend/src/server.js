// src/server.js
const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   PetCare API Server Running           ║
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}             ║
╚════════════════════════════════════════╝
    `);
});