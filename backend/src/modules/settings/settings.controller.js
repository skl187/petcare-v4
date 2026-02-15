const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT id, namespace, key, value, description, is_secret, is_active, created_at, updated_at
       FROM project_settings
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(successResponse({ data: result.rows, page: Number(page), limit: Number(limit) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch settings' });
  }
};

const getByKey = async (req, res) => {
  try {
    const { namespace = 'global' } = req.query;
    const result = await query(
      `SELECT id, namespace, key, value, description, is_secret, is_active, created_at, updated_at
       FROM project_settings
       WHERE namespace = $1 AND lower(key) = lower($2)`,
      [namespace, req.params.key]
    );

    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0]));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const create = async (req, res) => {
  try {
    const { namespace = 'global', key, value, description, is_secret, is_active } = req.body;
    if (!key) return res.status(400).json({ status: 'error', message: 'Key is required' });

    const result = await query(
      `INSERT INTO project_settings (namespace, key, value, description, is_secret, is_active, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, namespace, key, value, description, is_secret, is_active, created_at`,
      [namespace, key, value || null, description || null, is_secret === true, is_active === undefined ? true : is_active, (req.user && req.user.id) || null]
    );

    res.status(201).json(successResponse(result.rows[0], 'Created', 201));
  } catch (err) {
    res.status(500).json({ status: 'error', message: `Failed to create: ${err.message}` });
  }
};

const update = async (req, res) => {
  try {
    const { namespace = 'global' } = req.query;
    const { value, description, is_secret, is_active } = req.body;

    const result = await query(
      `UPDATE project_settings
       SET value = COALESCE($3, value), description = COALESCE($4, description), is_secret = COALESCE($5, is_secret), is_active = COALESCE($6, is_active)
       WHERE namespace = $1 AND lower(key) = lower($2)
       RETURNING id, namespace, key, value, description, is_secret, is_active, updated_at`,
      [namespace, req.params.key, value === undefined ? null : value, description === undefined ? null : description, is_secret === undefined ? null : is_secret, is_active === undefined ? null : is_active]
    );

    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0], 'Updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const remove = async (req, res) => {
  try {
    const { namespace = 'global' } = req.query;
    const result = await query(
      `DELETE FROM project_settings WHERE namespace = $1 AND lower(key) = lower($2) RETURNING id`,
      [namespace, req.params.key]
    );

    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, getByKey, create, update, delete: remove };
