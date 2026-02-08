// src/app.js
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./core/db/pool');
const { errorHandler } = require('./core/utils/response');
const authMiddleware = require('./core/auth/auth.middleware');
const rbacMiddleware = require('./core/rbac/rbac.middleware');
//const tenantMiddleware = require('./core/tenant/tenant.middleware');
//const auditMiddleware = require('./core/audit/audit.middleware');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    console.error('DB init error:', err);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

// Core middleware stack
//app.use(tenantMiddleware);
app.use(authMiddleware);
//app.use(rbacMiddleware);
//app.use(auditMiddleware);

// Routes
app.use('/api', routes);

// Serve API docs (static) from public/api-docs at /docs
const path = require('path');
app.use('/docs', express.static(path.join(__dirname, '..', 'public', 'docs')));
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'docs', 'index.html'));
});
app.get('/apis', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'docs', 'apis.html'));
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;