const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../core/auth/auth.middleware');
const settingsController = require('./settings.controller');

// All settings routes require authentication
router.use(requireAuth);

// List settings (superadmin use)
router.get('/', settingsController.list);
// Get by key
router.get('/:key', settingsController.getByKey);
// Create
router.post('/', settingsController.create);
// Update
router.put('/:key', settingsController.update);
// Delete
router.delete('/:key', settingsController.delete);

module.exports = router;
