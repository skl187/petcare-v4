// src/app.js
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./core/db/pool');
const { errorHandler } = require('./core/utils/response');
const { authMiddleware } = require('./core/auth/auth.middleware');
const { loadSettings } = require("./core/settings/settings.service");
// const rbacMiddleware = require('./core/rbac/rbac.middleware');
// const tenantMiddleware = require('./core/tenant/tenant.middleware');
// const auditMiddleware = require('./core/audit/audit.middleware');
const routes = require('./routes');

loadSettings();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root info
app.get('/', (req, res) => {
  res.json({
    message: 'api running',
    name: 'pet care api',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize DB
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    res.status(503).json({ error: '✗ Database unavailable/ DATABASE_URL is missing in .env' });
  }
});

// Core middleware stack
//app.use(tenantMiddleware);
app.use(authMiddleware);
// Attach RBAC helper (adds req.checkPermission) so controllers can call req.checkPermission(action, resource)
const { attachCheckPermission } = require('./core/rbac/rbac.middleware');
app.use(attachCheckPermission);
//app.use(auditMiddleware);

// Routes
app.use('/api', routes);

// Serve API docs (static) from public/api-docs at /docs
const path = require('path');
app.use('/docs', express.static(path.join(__dirname, '..', 'public', 'docs')));
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'docs', 'index.html'));
});
app.get('/swagger', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'swagger.html'));
});
app.get('/api-test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public','docs', 'test.html'));
});
app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public','docs', 'info.html'));
});
app.use("/icons", express.static(path.join(__dirname, "public/icons")));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;