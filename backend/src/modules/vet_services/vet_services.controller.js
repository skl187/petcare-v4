// src/modules/vet_services/vet_services.controller.js - CONTROLLER
// ============================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['deleted_at IS NULL'];
    const params = [];
    let idx = 1;

    if (q) {
      conditions.push(`(lower(name) LIKE $${idx} OR lower(code) LIKE $${idx})`);
      params.push(`%${String(q).toLowerCase()}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `SELECT id, code, name, description, default_duration_minutes, default_fee, service_type, status, created_at
                 FROM vet_services
                 ${where}
                 ORDER BY name ASC
                 LIMIT $${idx++} OFFSET $${idx++}`;

    params.push(limit, offset);

    const result = await query(sql, params);
    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: `Failed to fetch : ${err.message}` });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM vet_services WHERE id = $1 AND deleted_at IS NULL`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0]));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const create = async (req, res) => {
  try {
    const { code, name, description, default_duration_minutes, default_fee, service_type, status } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'name', msg: 'Name is required' }] });
    }

    const result = await query(
      `INSERT INTO vet_services (code, name, description, default_duration_minutes, default_fee, service_type, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, code, name, created_at`,
      [code || null, name, description || null, default_duration_minutes || 30, default_fee || 0.00, service_type || null, status === undefined ? 1 : status, (req.user && req.user.id) || null]
    );

    res.status(201).json(successResponse(result.rows[0], 'Created', 201));
  } catch (err) {
    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({ status: 'error', message: isProd ? 'Failed to create' : `Failed to create: ${err.message}` });
  }
};

const update = async (req, res) => {
  try {
    const { code, name, description, default_duration_minutes, default_fee, service_type, status } = req.body;

    const result = await query(
      `UPDATE vet_services
       SET code = COALESCE($2, code),
           name = COALESCE($3, name),
           description = COALESCE($4, description),
           default_duration_minutes = COALESCE($5, default_duration_minutes),
           default_fee = COALESCE($6, default_fee),
           service_type = COALESCE($7, service_type),
           status = COALESCE($8, status)
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, updated_at`,
      [
        req.params.id,
        code === undefined ? null : code,
        name === undefined ? null : name,
        description === undefined ? null : description,
        default_duration_minutes === undefined ? null : default_duration_minutes,
        default_fee === undefined ? null : default_fee,
        service_type === undefined ? null : service_type,
        status === undefined ? null : status
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0], 'Updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const delete_service = async (req, res) => {
  try {
    const result = await query(`UPDATE vet_services SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, getById, create, update, delete: delete_service };