// src/modules/permissions/permissions.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const { requireAuth } = require('../../core/auth/auth.middleware');
const permissionsController = require('./permissions.controller');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// List all permissions
router.get('/',
  requireAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('resource').optional().trim()
  ],
  handleValidationErrors,
  permissionsController.listPermissions
);

// List unique resources
router.get('/resources',
  requireAuth,
  permissionsController.listResources
);

// Get all permissions grouped by resource (for role edit form)
router.get('/grouped',
  requireAuth,
  [query('search').optional().trim()],
  handleValidationErrors,
  permissionsController.getGroupedPermissions
);

// Get single permission
router.get('/:id',
  requireAuth,
  [param('id').isUUID()],
  handleValidationErrors,
  permissionsController.getPermission
);

// Create permission
router.post('/',
  requireAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('action').optional().trim(),
    body('resource').optional().trim(),
    body('description').optional().trim()
  ],
  handleValidationErrors,
  permissionsController.createPermission
);

// Update permission
router.put('/:id',
  requireAuth,
  [
    param('id').isUUID(),
    body('name').optional().trim(),
    body('action').optional().trim(),
    body('resource').optional().trim(),
    body('description').optional().trim()
  ],
  handleValidationErrors,
  permissionsController.updatePermission
);

// Delete permission
router.delete('/:id',
  requireAuth,
  [param('id').isUUID()],
  handleValidationErrors,
  permissionsController.deletePermission
);

module.exports = router;
