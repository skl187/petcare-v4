// src/core/rbac/rbac.middleware.js
const { query } = require('../db/pool');

// Check if a user has permission for a specific action on a resource
const checkPermission = async (userId, action, resource) => {
  // Check direct user permissions first (higher priority), Check user_permissions table 
  const userPerm = await query(
    `SELECT granted FROM user_permissions up
     JOIN permissions p ON up.permission_id = p.id
     WHERE up.user_id = $1 AND p.action = $2 AND p.resource = $3`,
    [userId, action, resource]
  );
  
  if (userPerm.rows.length > 0) return userPerm.rows[0].granted;

  // // Fall back to role-based permissions, Check role_permissions table
  const rolePerm = await query(
    `SELECT COUNT(*) as count FROM user_roles ur
     JOIN role_permissions rp ON ur.role_id = rp.role_id
     JOIN permissions p ON rp.permission_id = p.id
     WHERE ur.user_id = $1 AND p.action = $2 AND p.resource = $3`,
    [userId, action, resource]
  );

  return parseInt(rolePerm.rows[0].count) > 0;
};

// Middleware for routes
const authorize = (action, resource) => {
  return async (req, res, next) => {
    const hasPermission = await checkPermission(req.user.id, action, resource);
    
    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: `You need ${action} ${resource} permission`
      });
    }
    
    next();
  };
};

// Attach a helper to request so controllers can call `req.checkPermission(action, resource)`
const attachCheckPermission = (req, res, next) => {
  if (req.user) {
    req.checkPermission = (action, resource) => checkPermission(req.user.id, action, resource);
  } else {
    // if no user, default to rejected permission
    req.checkPermission = async () => false;
  }
  next();
};

module.exports = { checkPermission, authorize, attachCheckPermission };