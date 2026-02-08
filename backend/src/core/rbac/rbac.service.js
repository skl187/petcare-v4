// src/core/rbac/rbac.service.js
const { query } = require('../db/pool');

const checkPermission = async (userId, action, resource) => {
  const result = await query(
    `SELECT up.granted
     FROM user_permissions up
     JOIN permissions p ON up.permission_id = p.id
     WHERE up.user_id = $1
       AND p.action = $2
       AND p.resource = $3
       AND up.granted = true`,
    [userId, action, resource]
  );

  if (result.rows.length > 0) return result.rows[0].granted;

  // Check role permissions
  const roleResult = await query(
    `SELECT rp.permission_id
     FROM user_roles ur
     JOIN role_permissions rp ON ur.role_id = rp.role_id
     JOIN permissions p ON rp.permission_id = p.id
     WHERE ur.user_id = $1
       AND p.action = $2
       AND p.resource = $3`,
    [userId, action, resource]
  );

  return roleResult.rows.length > 0;
};

const getUserRoles = async (userId) => {
  const result = await query(
    `SELECT r.slug, r.name FROM roles r
     JOIN user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1`,
    [userId]
  );
  return result.rows.map(r => r.slug);
};

module.exports = { checkPermission, getUserRoles };
