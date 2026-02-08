// src/modules/breeds/breeds.controller.js - CONTROLLER
// ============================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, petTypeId } = req.query;
    const offset = (page - 1) * limit;

    let baseSql = `SELECT b.id, b.name, b.slug, b.description, b.status, b.pet_type_id, pt.name AS pet_type
       FROM breeds b
       LEFT JOIN pet_types pt ON b.pet_type_id = pt.id
       WHERE b.deleted_at IS NULL`;

    const params = [];
    if (petTypeId) {
      params.push(petTypeId);
      baseSql += ` AND b.pet_type_id = $${params.length}`;
    }

    params.push(limit, offset);
    baseSql += ` ORDER BY b.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(baseSql, params);

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit) }));
  } catch (err) {
    console.error('List breeds failed', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, pt.name AS pet_type
       FROM breeds b
       LEFT JOIN pet_types pt ON b.pet_type_id = pt.id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0]));
  } catch (err) {
    console.error('Get breed failed', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const create = async (req, res) => {
  try {
    const { name, slug, petTypeId, description, status } = req.body;

    // Basic validation
    if (!name || !String(name).trim()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'name', msg: 'Name is required' }] });
    }

    if (!petTypeId) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'petTypeId', msg: 'petTypeId is required' }] });
    }

    // Ensure pet type exists
    const petTypeRes = await query('SELECT id FROM pet_types WHERE id = $1 AND deleted_at IS NULL', [petTypeId]);
    if (petTypeRes.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid petTypeId' });
    }

    const result = await query(
      `INSERT INTO breeds (name, slug, pet_type_id, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, created_at`,
      [name, slug || null, petTypeId, description || null, status || 1, (req.user && req.user.id) || null]
    );
/*
    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, resource, changes, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [(req.user && req.user.id) || null, 'create', 'breed', JSON.stringify({ name, petTypeId }), JSON.stringify({ ip: req.ip })]
      );
    } catch (auditErr) {
      console.error('Failed to write audit log', auditErr);
      // Non-fatal - continue
    }
*/
    res.status(201).json(successResponse(result.rows[0], 'Created', 201));
  } catch (err) {
    //console.error('Create breed failed', err);
    res.status(500).json({ status: 'error', message: 'Failed to create' });
  }
};

const update = async (req, res) => {
  try {
    const { name, slug, petTypeId, description, status } = req.body;

    // Validate status when provided (must be 0 or 1)
    if (status !== undefined && !['0', '1', 0, 1].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'status', msg: 'Status must be 0 or 1' }]
      });
    }
    const statusParam = status === undefined ? null : Number(status);

    if (petTypeId) {
      const petTypeRes = await query('SELECT id FROM pet_types WHERE id = $1 AND deleted_at IS NULL', [petTypeId]);
      if (petTypeRes.rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid petTypeId' });
      }
    }

    const result = await query(
      `UPDATE breeds
       SET name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           pet_type_id = COALESCE($4, pet_type_id),
           description = COALESCE($5, description),
           status = COALESCE($6, status)
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, updated_at`,
      [req.params.id, name || null, slug || null, petTypeId || null, description || null, statusParam ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0], 'Updated'));
  } catch (err) {
    //console.error('Update breed failed', err);
    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const delete_breed = async (req, res) => {
  try {
    const result = await query(
      `UPDATE breeds SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    //logger.info('Breed deleted', { userId: req.user.id, breedId: req.params.id });

    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    //logger.error('Delete breed failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, getById, create, update, delete: delete_breed };
