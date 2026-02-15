// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initializeDatabase } = require('./core/db/pool');
const { errorHandler } = require('./core/utils/response');
const { authMiddleware } = require('./core/auth/auth.middleware');
const { attachCheckPermission } = require('./core/rbac/rbac.middleware');
const { loadSettings } = require('./core/settings/settings.service');

const routes = require('./routes');

const app = express();

// ==================== INITIALIZE CORE ====================
let dbReady = false;

async function initApp() {
  try {
    await initializeDatabase();
    await loadSettings();
    dbReady = true;
    console.log('✓ Database & settings initialized');
  } catch (err) {
    dbReady = false;
    console.warn('⚠️ Initialization warning:', err.message);
  }
}

// Call init but don't block app start
initApp();

// ==================== GLOBAL MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.originalUrl}`);
  next();
});

// DB readiness check (lightweight)
app.use((req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      error: 'Database not ready. Please try again shortly.'
    });
  }
  next();
});

// Auth + RBAC
app.use(authMiddleware);
app.use(attachCheckPermission);

// ==================== API ROUTES ====================
app.use('/api', routes);

// ==================== STATIC ROUTES ====================
const publicPath = path.join(__dirname, '..', 'public');

// docs
app.use('/docs', express.static(path.join(publicPath, 'docs')));

// test/info pages
app.get('/info', (req, res) => {
  res.sendFile(path.join(publicPath, 'docs', 'info.html'));
});

// icons
app.use('/icons', express.static(path.join(publicPath, 'icons')));

// ==================== ROOT ====================
app.get('/', (req, res) => {
  res.json({
    message: 'Pet Care API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: dbReady ? 'ok' : 'initializing',
    db: dbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ==================== 404 ====================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==================== GLOBAL ERROR ====================
app.use(errorHandler);

module.exports = app;