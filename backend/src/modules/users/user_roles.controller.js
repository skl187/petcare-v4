// src/modules/users/user_roles.controller.js
const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

/**
 * Get all roles for a user
 */
const getUserRoles = async (req, res) => {
  try {
    const { id } = req.params;

    // Check user exists
    const userResult = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const result = await query(
      `SELECT r.id, r.name, r.slug, r.description, ur.is_primary, ur.assigned_at
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1 AND r.deleted_at IS NULL
       ORDER BY ur.is_primary DESC, r.name`,
      [id]
    );

    res.json(successResponse({
      user: userResult.rows[0],
      roles: result.rows
    }));
  } catch (err) {
    console.error('Get user roles error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to get user roles' });
  }
};

/**
 * Assign role to user
 */
const assignRoleToUser = async (req, res) => {
  try {
    const { id } = req.params; // user_id
    const { role_id, is_primary } = req.body;

    // Check user exists
    const userResult = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Check role exists
    const roleResult = await query(
      'SELECT id, name, slug FROM roles WHERE id = $1 AND deleted_at IS NULL',
      [role_id]
    );
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    // Check if already assigned
    const existing = await query(
      'SELECT user_id FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [id, role_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Role already assigned to this user' });
    }

    // If setting as primary, unset other primaries
    if (is_primary) {
      await query(
        'UPDATE user_roles SET is_primary = FALSE WHERE user_id = $1',
        [id]
      );
    }

    await query(
      'INSERT INTO user_roles (user_id, role_id, is_primary) VALUES ($1, $2, $3)',
      [id, role_id, is_primary || false]
    );

    res.status(201).json(successResponse({
      user: userResult.rows[0],
      role: roleResult.rows[0]
    }, 'Role assigned to user'));
  } catch (err) {
    console.error('Assign role to user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to assign role' });
  }
};

/**
 * Remove role from user
 */
const removeRoleFromUser = async (req, res) => {
  try {
    const { id, roleId } = req.params;

    const result = await query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 RETURNING user_id, role_id',
      [id, roleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User-role assignment not found' });
    }

    res.json(successResponse(null, 'Role removed from user'));
  } catch (err) {
    console.error('Remove role from user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to remove role' });
  }
};

/**
 * Set primary role for user
 */
const setPrimaryRole = async (req, res) => {
  try {
    const { id, roleId } = req.params;

    // Check assignment exists
    const existing = await query(
      'SELECT user_id FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [id, roleId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User-role assignment not found' });
    }

    // Unset all primaries and set new one
    await query('UPDATE user_roles SET is_primary = FALSE WHERE user_id = $1', [id]);
    await query('UPDATE user_roles SET is_primary = TRUE WHERE user_id = $1 AND role_id = $2', [id, roleId]);

    res.json(successResponse(null, 'Primary role updated'));
  } catch (err) {
    console.error('Set primary role error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to set primary role' });
  }
};

/**
 * Set multiple roles for a user (replace all)
 */
const setUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_ids, primary_role_id } = req.body;

    // Check user exists
    const userResult = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Validate all role IDs exist
    if (role_ids && role_ids.length > 0) {
      const roleCheck = await query(
        'SELECT id FROM roles WHERE id = ANY($1) AND deleted_at IS NULL',
        [role_ids]
      );
      if (roleCheck.rows.length !== role_ids.length) {
        return res.status(400).json({ status: 'error', message: 'Some roles not found' });
      }
    }

    // Remove all existing roles
    await query('DELETE FROM user_roles WHERE user_id = $1', [id]);

    // Add new roles
    if (role_ids && role_ids.length > 0) {
      for (const roleId of role_ids) {
        const isPrimary = primary_role_id ? roleId === primary_role_id : false;
        await query(
          'INSERT INTO user_roles (user_id, role_id, is_primary) VALUES ($1, $2, $3)',
          [id, roleId, isPrimary]
        );
      }
    }

    // Return updated roles
    const result = await query(
      `SELECT r.id, r.name, r.slug, r.description, ur.is_primary, ur.assigned_at
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1 AND r.deleted_at IS NULL
       ORDER BY ur.is_primary DESC, r.name`,
      [id]
    );

    res.json(successResponse({
      user: userResult.rows[0],
      roles: result.rows
    }, 'User roles updated'));
  } catch (err) {
    console.error('Set user roles error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to set user roles' });
  }
};

/**
 * Get all permissions for a user (combined from roles + direct)
 */
const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    // Check user exists
    const userResult = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Get permissions from roles
    const rolePermissions = await query(
      `SELECT DISTINCT p.id, p.name, p.action, p.resource, p.description, 'role' as source
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1 AND p.deleted_at IS NULL`,
      [id]
    );

    // Get direct user permissions
    const directPermissions = await query(
      `SELECT p.id, p.name, p.action, p.resource, p.description,
              CASE WHEN up.granted THEN 'granted' ELSE 'denied' END as source
       FROM permissions p
       INNER JOIN user_permissions up ON p.id = up.permission_id
       WHERE up.user_id = $1 AND p.deleted_at IS NULL`,
      [id]
    );

    // Combine and deduplicate (direct permissions override role permissions)
    const permMap = new Map();

    for (const perm of rolePermissions.rows) {
      permMap.set(perm.id, { ...perm, effective: true });
    }

    for (const perm of directPermissions.rows) {
      permMap.set(perm.id, { ...perm, effective: perm.source === 'granted' });
    }

    const permissions = Array.from(permMap.values());

    res.json(successResponse({
      user: userResult.rows[0],
      permissions,
      effective_permissions: permissions.filter(p => p.effective)
    }));
  } catch (err) {
    console.error('Get user permissions error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to get user permissions' });
  }
};

/**
 * Grant direct permission to user
 */
const grantPermissionToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_id, granted } = req.body;

    // Check user exists
    const userResult = await query(
      'SELECT id, email FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Check permission exists
    const permResult = await query(
      'SELECT id, name FROM permissions WHERE id = $1 AND deleted_at IS NULL',
      [permission_id]
    );
    if (permResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }

    // Upsert the permission
    await query(
      `INSERT INTO user_permissions (user_id, permission_id, granted)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, permission_id)
       DO UPDATE SET granted = $3, granted_at = NOW()`,
      [id, permission_id, granted !== false]
    );

    res.json(successResponse({
      user: userResult.rows[0],
      permission: permResult.rows[0],
      granted: granted !== false
    }, granted !== false ? 'Permission granted to user' : 'Permission denied for user'));
  } catch (err) {
    console.error('Grant permission to user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update user permission' });
  }
};

/**
 * Remove direct permission from user
 */
const removePermissionFromUser = async (req, res) => {
  try {
    const { id, permissionId } = req.params;

    const result = await query(
      'DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2 RETURNING user_id, permission_id',
      [id, permissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User-permission assignment not found' });
    }

    res.json(successResponse(null, 'Direct permission removed from user'));
  } catch (err) {
    console.error('Remove permission from user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to remove permission' });
  }
};

module.exports = {
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  setPrimaryRole,
  setUserRoles,
  getUserPermissions,
  grantPermissionToUser,
  removePermissionFromUser
};
