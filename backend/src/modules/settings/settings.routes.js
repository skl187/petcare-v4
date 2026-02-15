const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { attachCheckPermission } = require('../../core/rbac/rbac.middleware');

// Attach permission helper
//router.use(attachCheckPermission);

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
