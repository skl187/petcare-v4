// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const logger = require('./core/utils/logger');
const { initializeDatabase } = require('./core/db/pool');
const { errorHandler } = require('./core/utils/response');
const { authMiddleware } = require('./core/auth/auth.middleware');
const { attachCheckPermission } = require('./core/rbac/rbac.middleware');
const { loadSettings, onSettingsReload } = require('./core/settings/settings.service');
const { resetTransporter } = require('./core/email/email.service');

const routes = require('./routes');

// Reset cached email transporter whenever settings are reloaded from DB
onSettingsReload(() => resetTransporter());

const app = express();

// ==================== INITIALIZE CORE ====================
let dbReady = false;

async function initApp() {
  try {
    await initializeDatabase();
    await loadSettings();
    dbReady = true;
    logger.info('Database & settings initialized');
  } catch (err) {
    dbReady = false;
    logger.warn('Initialization warning', err);
  }
}

// Call init but don't block app start
initApp();

// ==================== GLOBAL MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  next();
});

// DB readiness check (lightweight)
app.use((req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      status: 'error',
      message: 'Database not ready. Please try again shortly.',
      timestamp: new Date().toISOString()
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
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// ==================== GLOBAL ERROR ====================
app.use(errorHandler);

module.exports = app;
