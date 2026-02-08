// src/modules/roles/roles_permissions.controller.js
const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

/**
 * Get all permissions for a role
 */
const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    // Check role exists
    const roleResult = await query(
      'SELECT id, name, slug FROM roles WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    const result = await query(
      `SELECT p.id, p.name, p.action, p.resource, p.description
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.resource, p.name`,
      [id]
    );

    res.json(successResponse({
      role: roleResult.rows[0],
      permissions: result.rows
    }));
  } catch (err) {
    console.error('Get role permissions error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to get role permissions' });
  }
};

/**
 * Grant permission to role
 */
const grantPermissionToRole = async (req, res) => {
  try {
    const { id } = req.params; // role_id
    const { permission_id } = req.body;

    // Check role exists
    const roleResult = await query(
      'SELECT id, name, slug FROM roles WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    // Check permission exists
    const permResult = await query(
      'SELECT id, name FROM permissions WHERE id = $1 AND deleted_at IS NULL',
      [permission_id]
    );
    if (permResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }

    // Check if already granted
    const existing = await query(
      'SELECT role_id FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [id, permission_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Permission already granted to this role' });
    }

    await query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
      [id, permission_id]
    );

    res.status(201).json(successResponse({
      role: roleResult.rows[0],
      permission: permResult.rows[0]
    }, 'Permission granted to role'));
  } catch (err) {
    console.error('Grant permission to role error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to grant permission' });
  }
};

/**
 * Revoke permission from role
 */
const revokePermissionFromRole = async (req, res) => {
  try {
    const { id, permissionId } = req.params;

    const result = await query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2 RETURNING role_id, permission_id',
      [id, permissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role-permission assignment not found' });
    }

    res.json(successResponse(null, 'Permission revoked from role'));
  } catch (err) {
    console.error('Revoke permission from role error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to revoke permission' });
  }
};

/**
 * Set multiple permissions for a role (replace all)
 */
const setRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_ids } = req.body;

    // Check role exists
    const roleResult = await query(
      'SELECT id, name, slug FROM roles WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    // Validate all permission IDs exist
    if (permission_ids && permission_ids.length > 0) {
      const permCheck = await query(
        'SELECT id FROM permissions WHERE id = ANY($1) AND deleted_at IS NULL',
        [permission_ids]
      );
      if (permCheck.rows.length !== permission_ids.length) {
        return res.status(400).json({ status: 'error', message: 'Some permissions not found' });
      }
    }

    // Remove all existing permissions
    await query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

    // Add new permissions
    if (permission_ids && permission_ids.length > 0) {
      const values = permission_ids.map((pid, i) => `($1, $${i + 2})`).join(', ');
      await query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
        [id, ...permission_ids]
      );
    }

    // Return updated permissions
    const result = await query(
      `SELECT p.id, p.name, p.action, p.resource, p.description
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.resource, p.name`,
      [id]
    );

    res.json(successResponse({
      role: roleResult.rows[0],
      permissions: result.rows
    }, 'Role permissions updated'));
  } catch (err) {
    console.error('Set role permissions error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to set role permissions' });
  }
};

module.exports = {
  getRolePermissions,
  grantPermissionToRole,
  revokePermissionFromRole,
  setRolePermissions
};
