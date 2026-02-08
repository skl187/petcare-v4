

// src/modules/users/users.controller.js
const { query, transaction } = require('../../core/db/pool');
const { getPaginationParams, paginate } = require('../../core/utils/pagination');
const { successResponse } = require('../../core/utils/response');
const { hashPassword } = require('../../core/auth/password.service');

const getAllUsers = async (req, res) => {
  try {
    const { limit, offset } = getPaginationParams(req);

    // Check permission
    const hasPermission = await req.checkPermission('read', 'user');
    if (!hasPermission) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden' 
      });
    }

    const countResult = await query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
    const result = await query(
      `SELECT id, email, first_name, last_name, display_name, status, created_at
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const data = paginate(result.rows, parseInt(countResult.rows[0].count), req.query.page || 1, limit);
    res.json(successResponse(data));

  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch users' 
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT id, email, first_name, last_name, display_name, avatar_url, bio, status, created_at
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    res.json(successResponse(result.rows[0]));

  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch user' 
    });
  }
};

const createUser = async (req, res) => {
  try {
    const hasPermission = await req.checkPermission('create', 'user');
    if (!hasPermission) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden' 
      });
    }

    const { email, password, first_name, last_name, role_slug } = req.body;

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        status: 'error',
        message: 'Email already exists' 
      });
    }

    const password_hash = await hashPassword(password);

    const result = await transaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, display_name, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, display_name, status, created_at`,
        [email, password_hash, first_name, last_name, `${first_name} ${last_name}`, 'active']
      );

      const user = userResult.rows[0];

      if (role_slug) {
        const roleResult = await client.query(
          'SELECT id FROM roles WHERE slug = $1',
          [role_slug]
        );
        if (roleResult.rows.length > 0) {
          await client.query(
            'INSERT INTO user_roles (user_id, role_id, is_primary) VALUES ($1, $2, $3)',
            [user.id, roleResult.rows[0].id, true]
          );
        }
      }

      return user;
    });

    //req.auditLog('create', 'user', { email, role: role_slug });

    res.status(201).json(successResponse(result, 'User created successfully', 201));

  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to create user' 
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const hasPermission = await req.checkPermission('update', 'user');
    if (!hasPermission) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden' 
      });
    }

    const { id } = req.params;
    const { first_name, last_name, avatar_url, bio, status } = req.body;

    const result = await query(
      `UPDATE users
       SET first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           avatar_url = COALESCE($4, avatar_url),
           bio = COALESCE($5, bio),
           status = COALESCE($6, status)
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, email, first_name, last_name, display_name, status, updated_at`,
      [id, first_name, last_name, avatar_url, bio, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    req.auditLog('update', 'user', { userId: id, changes: req.body });

    res.json(successResponse(result.rows[0], 'User updated successfully'));

  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to update user' 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const hasPermission = await req.checkPermission('delete', 'user');
    if (!hasPermission) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden' 
      });
    }

    const { id } = req.params;

    const result = await query(
      'UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    req.auditLog('delete', 'user', { userId: id });

    res.json(successResponse(null, 'User deleted successfully'));

  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete user' 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};