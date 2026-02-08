// src/modules/users/users.routes.js
const express = require('express');
const { body, param } = require('express-validator');
const { requireAuth } = require('../../core/auth/auth.middleware');
const usersController = require('./users.controller');
const userRolesController = require('./user_roles.controller');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// User CRUD
router.get('/', requireAuth, usersController.getAllUsers);
router.get('/:id', requireAuth, usersController.getUserById);
router.post('/', requireAuth, usersController.createUser);
router.put('/:id', requireAuth, usersController.updateUser);
router.delete('/:id', requireAuth, usersController.deleteUser);

// ============================================================================
// User-Role endpoints
// ============================================================================

// Get all roles for a user
router.get('/:id/roles',
  requireAuth,
  [param('id').isUUID()],
  handleValidationErrors,
  userRolesController.getUserRoles
);

// Assign role to user
router.post('/:id/roles',
  requireAuth,
  [
    param('id').isUUID(),
    body('role_id').isUUID().withMessage('Valid role_id is required'),
    body('is_primary').optional().isBoolean()
  ],
  handleValidationErrors,
  userRolesController.assignRoleToUser
);

// Set all roles for a user (replace)
router.put('/:id/roles',
  requireAuth,
  [
    param('id').isUUID(),
    body('role_ids').isArray().withMessage('role_ids must be an array'),
    body('role_ids.*').isUUID().withMessage('Each role_id must be a valid UUID'),
    body('primary_role_id').optional().isUUID()
  ],
  handleValidationErrors,
  userRolesController.setUserRoles
);

// Remove role from user
router.delete('/:id/roles/:roleId',
  requireAuth,
  [
    param('id').isUUID(),
    param('roleId').isUUID()
  ],
  handleValidationErrors,
  userRolesController.removeRoleFromUser
);

// Set primary role
router.patch('/:id/roles/:roleId/primary',
  requireAuth,
  [
    param('id').isUUID(),
    param('roleId').isUUID()
  ],
  handleValidationErrors,
  userRolesController.setPrimaryRole
);

// ============================================================================
// User-Permission endpoints
// ============================================================================

// Get all permissions for a user (combined from roles + direct)
router.get('/:id/permissions',
  requireAuth,
  [param('id').isUUID()],
  handleValidationErrors,
  userRolesController.getUserPermissions
);

// Grant/deny direct permission to user
router.post('/:id/permissions',
  requireAuth,
  [
    param('id').isUUID(),
    body('permission_id').isUUID().withMessage('Valid permission_id is required'),
    body('granted').optional().isBoolean()
  ],
  handleValidationErrors,
  userRolesController.grantPermissionToUser
);

// Remove direct permission from user
router.delete('/:id/permissions/:permissionId',
  requireAuth,
  [
    param('id').isUUID(),
    param('permissionId').isUUID()
  ],
  handleValidationErrors,
  userRolesController.removePermissionFromUser
);

module.exports = router;