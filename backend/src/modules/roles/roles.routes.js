//src/modules/roles/roles.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const { requireAuth } = require('../../core/auth/auth.middleware');
const rolesController = require('./roles.controller');
const rolePermissionsController = require('./roles_permissions.controller');

const router = express.Router();

// Simple validation handler used in your project (reuse existing one if available)
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// TODO: Replace requireAuth with permission checks (e.g., requirePermission('manage_roles'))

router.get('/',
  requireAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim()
  ],
  handleValidationErrors,
  rolesController.listRoles
);

router.get('/:id',
  requireAuth,
  [ param('id').isUUID() ],
  handleValidationErrors,
  rolesController.getRole
);

router.post('/',
  requireAuth,
  [
    body('name').trim().notEmpty(),
    body('slug').trim().notEmpty(),
    body('description').optional().trim()
  ],
  handleValidationErrors,
  rolesController.createRole
);

router.put('/:id',
  requireAuth,
  [
    param('id').isUUID(),
    body('name').optional().trim(),
    body('slug').optional().trim(),
    body('description').optional().trim()
  ],
  handleValidationErrors,
  rolesController.updateRole
);

router.delete('/:id',
  requireAuth,
  [ param('id').isUUID() ],
  handleValidationErrors,
  rolesController.deleteRole
);

// ============================================================================
// Role-Permission endpoints
// ============================================================================

// Get all permissions for a role
router.get('/:id/permissions',
  requireAuth,
  [param('id').isUUID()],
  handleValidationErrors,
  rolePermissionsController.getRolePermissions
);

// Grant permission to role
router.post('/:id/permissions',
  requireAuth,
  [
    param('id').isUUID(),
    body('permission_id').isUUID().withMessage('Valid permission_id is required')
  ],
  handleValidationErrors,
  rolePermissionsController.grantPermissionToRole
);

// Set all permissions for a role (replace)
router.put('/:id/permissions',
  requireAuth,
  [
    param('id').isUUID(),
    body('permission_ids').isArray().withMessage('permission_ids must be an array'),
    body('permission_ids.*').isUUID().withMessage('Each permission_id must be a valid UUID')
  ],
  handleValidationErrors,
  rolePermissionsController.setRolePermissions
);

// Revoke permission from role
router.delete('/:id/permissions/:permissionId',
  requireAuth,
  [
    param('id').isUUID(),
    param('permissionId').isUUID()
  ],
  handleValidationErrors,
  rolePermissionsController.revokePermissionFromRole
);

module.exports = router;