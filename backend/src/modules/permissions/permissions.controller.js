// src/modules/permissions/permissions.controller.js
const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

/**
 * List permissions with pagination/search
 */
const listPermissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const resource = (req.query.resource || '').trim();

    const params = [];
    let where = 'WHERE deleted_at IS NULL';

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where += ` AND (lower(name) LIKE $${params.length} OR lower(description) LIKE $${params.length})`;
    }

    if (resource) {
      params.push(resource.toLowerCase());
      where += ` AND lower(resource) = $${params.length}`;
    }

    params.push(limit, offset);

    const rowsResult = await query(
      `SELECT id, name, action, resource, description, created_at, updated_at
       FROM permissions
       ${where}
       ORDER BY resource, name
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await query(
      `SELECT count(*)::int AS total FROM permissions ${where}`,
      params.slice(0, params.length - 2)
    );

    const total = countResult.rows[0] ? countResult.rows[0].total : 0;

    res.json(successResponse({
      permissions: rowsResult.rows,
      meta: { total, page, limit }
    }));
  } catch (err) {
    console.error('List permissions error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list permissions' });
  }
};

/**
 * Get single permission by ID
 */
const getPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT id, name, action, resource, description, created_at, updated_at
       FROM permissions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }

    res.json(successResponse({ permission: result.rows[0] }));
  } catch (err) {
    console.error('Get permission error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch permission' });
  }
};

/**
 * Create new permission
 */
const createPermission = async (req, res) => {
  try {
    const { name, action, resource, description } = req.body;

    // Check for duplicate name
    const existing = await query(
      'SELECT id FROM permissions WHERE lower(name) = lower($1) AND deleted_at IS NULL',
      [name.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Permission with this name already exists' });
    }

    const result = await query(
      `INSERT INTO permissions (name, action, resource, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, action, resource, description, created_at, updated_at`,
      [name.trim(), action || null, resource || null, description || null]
    );

    res.status(201).json(successResponse({ permission: result.rows[0] }, 'Permission created'));
  } catch (err) {
    console.error('Create permission error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create permission' });
  }
};

/**
 * Update permission
 */
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, action, resource, description } = req.body;

    const existing = await query(
      'SELECT id FROM permissions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (typeof name !== 'undefined') {
      fields.push(`name = $${idx++}`);
      params.push(name.trim());
    }
    if (typeof action !== 'undefined') {
      fields.push(`action = $${idx++}`);
      params.push(action);
    }
    if (typeof resource !== 'undefined') {
      fields.push(`resource = $${idx++}`);
      params.push(resource);
    }
    if (typeof description !== 'undefined') {
      fields.push(`description = $${idx++}`);
      params.push(description);
    }

    if (fields.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    params.push(id);
    const sql = `UPDATE permissions SET ${fields.join(', ')}, updated_at = NOW()
                 WHERE id = $${idx}
                 RETURNING id, name, action, resource, description, created_at, updated_at`;

    const result = await query(sql, params);

    res.json(successResponse({ permission: result.rows[0] }, 'Permission updated'));
  } catch (err) {
    console.error('Update permission error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update permission' });
  }
};

/**
 * Delete permission (soft delete)
 */
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query(
      'SELECT id FROM permissions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Permission not found' });
    }

    await query('UPDATE permissions SET deleted_at = NOW() WHERE id = $1', [id]);

    res.json(successResponse(null, 'Permission deleted'));
  } catch (err) {
    console.error('Delete permission error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete permission' });
  }
};

/**
 * List unique resources (for filtering UI)
 */
const listResources = async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT resource FROM permissions
       WHERE deleted_at IS NULL AND resource IS NOT NULL
       ORDER BY resource`
    );

    res.json(successResponse({
      resources: result.rows.map(r => r.resource)
    }));
  } catch (err) {
    console.error('List resources error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list resources' });
  }
};

/**
 * Get all permissions grouped by resource (for role edit form)
 * Returns permissions organized by resource/category with counts
 */
const getGroupedPermissions = async (req, res) => {
  try {
    const search = (req.query.search || '').trim();

    let where = 'WHERE deleted_at IS NULL';
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where += ` AND (lower(name) LIKE $${params.length} OR lower(description) LIKE $${params.length})`;
    }

    const result = await query(
      `SELECT id, name, action, resource, description
       FROM permissions
       ${where}
       ORDER BY resource NULLS FIRST, name`,
      params
    );

    // Group permissions by resource
    const grouped = {};
    const resourceOrder = [];

    for (const perm of result.rows) {
      const resource = perm.resource || 'General';
      if (!grouped[resource]) {
        grouped[resource] = [];
        resourceOrder.push(resource);
      }
      grouped[resource].push({
        id: perm.id,
        name: perm.name,
        action: perm.action,
        description: perm.description
      });
    }

    // Build response with resource metadata
    const resources = resourceOrder.map(resource => ({
      name: resource,
      permission_count: grouped[resource].length,
      permissions: grouped[resource]
    }));

    res.json(successResponse({
      resources,
      total_permissions: result.rows.length,
      total_resources: resources.length
    }));
  } catch (err) {
    console.error('Get grouped permissions error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to get grouped permissions' });
  }
};

module.exports = {
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  listResources,
  getGroupedPermissions
};
