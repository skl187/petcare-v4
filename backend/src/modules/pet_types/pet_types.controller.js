// src/modules/pet_types/pet_types.controller.js - CONTROLLER
// ============================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');
//const logger = require('../../core/utils/logger');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, name, slug, icon_url, status, created_at
       FROM pet_types
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    //logger.info('Pet types listed', { userId: req.user.id, count: result.rows.length });

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit) }));
  } catch (err) {
    //logger.error('List pet types failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM pet_types WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0]));
  } catch (err) {
    //logger.error('Get pet type failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const create = async (req, res) => {
  try {
    const { name, slug, icon_url, status } = req.body;

    // Basic validation
    if (!name || !String(name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'name', msg: 'Name is required' }]
      });
    }

    //logger.info('Creating pet type', { userId: req.user && req.user.id, body: { name, slug, icon_url } });

    const result = await query(
      `INSERT INTO pet_types (name, slug, icon_url, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, icon_url, created_at`,
      [name, slug || null, icon_url || null, status || 1, (req.user && req.user.id) || null]
    );

    //logger.info('Pet type created', { userId: req.user && req.user.id, petTypeId: result.rows[0].id });

    res.status(201).json(successResponse(result.rows[0], 'Created', 201));
  } catch (err) {
    // Log details for debugging
    //logger.error('Create pet type failed', { error: err.message, stack: err.stack });

    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({ status: 'error', message: isProd ? 'Failed to create' : `Failed to create: ${err.message}` });
  }
};

const update = async (req, res) => {
  try {
    const { name, slug, icon_url, status } = req.body;

    // Validate status when provided (must be 0 or 1)
    if (status !== undefined && !['0', '1', 0, 1].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'status', msg: 'Status must be 0 or 1' }]
      });
    }

    const statusParam = status === undefined ? null : Number(status);

    const result = await query(
      `UPDATE pet_types
       SET name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           icon_url = COALESCE($4, icon_url),
           status = COALESCE($5, status)
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name, icon_url, updated_at`,
      [req.params.id, name === undefined ? null : name, slug === undefined ? null : slug, icon_url === undefined ? null : icon_url, statusParam]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0], 'Updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const delete_pet_type = async (req, res) => {
  try {
    const result = await query(
      `UPDATE pet_types SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    //logger.info('Pet type deleted', { userId: req.user.id, petTypeId: req.params.id });

    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    //logger.error('Delete pet type failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, getById, create, update, delete: delete_pet_type };
