const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

/**
 * List roles with permission counts and assigned users
 */
const listRoles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const params = [];
    let where = 'WHERE r.deleted_at IS NULL';

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where += ` AND (lower(r.name) LIKE $${params.length} OR lower(r.slug) LIKE $${params.length})`;
    }

    params.push(limit, offset);

    // Get roles with permission count
    const rowsResult = await query(
      `SELECT
         r.id, r.name, r.slug, r.description, r.created_at, r.updated_at,
         COALESCE(pc.permission_count, 0)::int AS permission_count
       FROM roles r
       LEFT JOIN (
         SELECT role_id, COUNT(*)::int AS permission_count
         FROM role_permissions
         GROUP BY role_id
       ) pc ON r.id = pc.role_id
       ${where}
       ORDER BY r.name
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    // Get users for each role
    const roleIds = rowsResult.rows.map(r => r.id);
    let usersMap = {};

    if (roleIds.length > 0) {
      const usersResult = await query(
        `SELECT
           ur.role_id,
           u.id, u.email, u.first_name, u.last_name, u.display_name
         FROM user_roles ur
         INNER JOIN users u ON ur.user_id = u.id
         WHERE ur.role_id = ANY($1) AND u.deleted_at IS NULL
         ORDER BY u.first_name, u.last_name`,
        [roleIds]
      );

      // Group users by role_id
      for (const user of usersResult.rows) {
        if (!usersMap[user.role_id]) {
          usersMap[user.role_id] = [];
        }
        usersMap[user.role_id].push({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name || `${user.first_name} ${user.last_name}`
        });
      }
    }

    // Attach users to roles
    const roles = rowsResult.rows.map(role => ({
      ...role,
      users: usersMap[role.id] || [],
      user_count: (usersMap[role.id] || []).length
    }));

    const countResult = await query(
      `SELECT count(*)::int AS total FROM roles r ${where}`,
      params.slice(0, params.length - 2)
    );

    const total = countResult.rows[0] ? countResult.rows[0].total : 0;

    res.json(successResponse({
      roles,
      meta: { total, page, limit }
    }));
  } catch (err) {
    console.error('List roles error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list roles' });
  }
};

/**
 * Get single role with users and permissions grouped by resource
 */
const getRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, slug, description, created_at, updated_at FROM roles WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    const role = result.rows[0];

    // Get users assigned to this role
    const usersResult = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.display_name, ur.is_primary
       FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       WHERE ur.role_id = $1 AND u.deleted_at IS NULL
       ORDER BY u.first_name, u.last_name`,
      [id]
    );

    // Get permissions assigned to this role
    const permissionsResult = await query(
      `SELECT p.id, p.name, p.action, p.resource, p.description
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.resource, p.name`,
      [id]
    );

    // Get all permissions grouped by resource (for the edit form)
    const allPermissionsResult = await query(
      `SELECT id, name, action, resource, description
       FROM permissions
       WHERE deleted_at IS NULL
       ORDER BY resource, name`
    );

    // Group all permissions by resource
    const permissionsByResource = {};
    for (const perm of allPermissionsResult.rows) {
      const resource = perm.resource || 'General';
      if (!permissionsByResource[resource]) {
        permissionsByResource[resource] = [];
      }
      permissionsByResource[resource].push(perm);
    }

    // Create a set of assigned permission IDs for quick lookup
    const assignedPermissionIds = new Set(permissionsResult.rows.map(p => p.id));

    res.json(successResponse({
      role: {
        ...role,
        users: usersResult.rows.map(u => ({
          id: u.id,
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name,
          display_name: u.display_name || `${u.first_name} ${u.last_name}`,
          is_primary: u.is_primary
        })),
        user_count: usersResult.rows.length,
        permissions: permissionsResult.rows,
        permission_count: permissionsResult.rows.length,
        assigned_permission_ids: Array.from(assignedPermissionIds)
      },
      permissions_by_resource: permissionsByResource
    }));
  } catch (err) {
    console.error('Get role error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch role' });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    // Check for duplicate slug
    const existing = await query(
      'SELECT id FROM roles WHERE lower(slug) = lower($1) AND deleted_at IS NULL',
      [slug.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Role with this slug already exists' });
    }

    const result = await query(
      `INSERT INTO roles (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created_at, updated_at`,
      [name.trim(), slug.trim(), description || null]
    );

    res.status(201).json(successResponse({ role: result.rows[0] }, 'Role created'));
  } catch (err) {
    console.error('Create role error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create role' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const existing = await query('SELECT id FROM roles WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (typeof name !== 'undefined') { fields.push(`name = $${idx++}`); params.push(name.trim()); }
    if (typeof slug !== 'undefined') { fields.push(`slug = $${idx++}`); params.push(slug.trim()); }
    if (typeof description !== 'undefined') { fields.push(`description = $${idx++}`); params.push(description); }

    if (fields.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    params.push(id);
    const sql = `UPDATE roles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, name, slug, description, created_at, updated_at`;

    const result = await query(sql, params);

    res.json(successResponse({ role: result.rows[0] }, 'Role updated'));
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update role' });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM roles WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }

    await query('UPDATE roles SET deleted_at = NOW() WHERE id = $1', [id]);

    res.json(successResponse(null, 'Role deleted'));
  } catch (err) {
    console.error('Delete role error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete role' });
  }
};

module.exports = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole
};
