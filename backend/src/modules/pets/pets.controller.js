// src/modules/pets/pets.controller.js - CONTROLLER
// ============================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');
//const logger = require('../../core/utils/logger');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.id, p.name, p.slug, p.size, p.date_of_birth, p.age, p.gender, p.weight, p.height, p.status,
              pt.name AS pet_type, b.name AS breed, u.email AS owner_email
       FROM pets p
       LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
       LEFT JOIN breeds b ON p.breed_id = b.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    //logger.info('Pets listed', { userId: req.user.id, count: result.rows.length });

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    }));

  } catch (err) {
    //logger.error('Pets list failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, pt.name AS pet_type, b.name AS breed, u.email AS owner_email
       FROM pets p
       LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
       LEFT JOIN breeds b ON p.breed_id = b.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0]));

  } catch (err) {
    //logger.error('Get pet failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const create = async (req, res) => {
  try {
    const {
      name, slug, petTypeId, breedId, size, dateOfBirth, age, gender,
      weight, height, weightUnit, heightUnit, additionalInfo
    } = req.body;

    const result = await query(
      `INSERT INTO pets (name, slug, pet_type_id, breed_id, size, date_of_birth, age, gender,
                         weight, height, weight_unit, height_unit, user_id, additional_info, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id, name, created_at`,
      [name, slug || null, petTypeId, breedId || null, size || null, dateOfBirth || null, age || null, gender || null,
       weight || null, height || null, weightUnit || null, heightUnit || null, req.user.id, JSON.stringify(additionalInfo || {}), 1]
    );

    //logger.info('Pet created', { userId: req.user.id, petId: result.rows[0].id });

    // Audit log
    // await query(
    //   `INSERT INTO audit_logs (user_id, action, resource, changes, metadata)
    //    VALUES ($1, $2, $3, $4, $5)`,
    //   [req.user.id, 'create', 'pet', JSON.stringify({ name, petTypeId, breedId }), JSON.stringify({ ip: req.ip })]
    // );

    res.status(201).json(successResponse(result.rows[0], 'Created', 201));

  } catch (err) {
    //logger.error('Create pet failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to create' });
  }
};

const update = async (req, res) => {
  try {
    const {
      name, slug, petTypeId, breedId, size, dateOfBirth, age, gender,
      weight, height, weightUnit, heightUnit, additionalInfo, status
    } = req.body;

    const result = await query(
      `UPDATE pets
       SET name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           pet_type_id = COALESCE($4, pet_type_id),
           breed_id = COALESCE($5, breed_id),
           size = COALESCE($6, size),
           date_of_birth = COALESCE($7, date_of_birth),
           age = COALESCE($8, age),
           gender = COALESCE($9, gender),
           weight = COALESCE($10, weight),
           height = COALESCE($11, height),
           weight_unit = COALESCE($12, weight_unit),
           height_unit = COALESCE($13, height_unit),
           additional_info = COALESCE($14, additional_info),
           status = COALESCE($15, status)
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, updated_at`,
      [req.params.id, name || null, slug || null, petTypeId || null, breedId || null, size || null, dateOfBirth || null,
       age || null, gender || null, weight || null, height || null, weightUnit || null, heightUnit || null,
       additionalInfo ? JSON.stringify(additionalInfo) : null, status || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    //logger.info('Pet updated', { userId: req.user.id, petId: req.params.id });

    res.json(successResponse(result.rows[0], 'Updated'));

  } catch (err) {
    //logger.error('Update pet failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const delete_pet = async (req, res) => {
  try {
    const result = await query(
      `UPDATE pets SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    //logger.info('Pet deleted', { userId: req.user.id, petId: req.params.id });

    res.json(successResponse(null, 'Deleted'));

  } catch (err) {
    //logger.error('Delete pet failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, getById, create, update, delete: delete_pet };
