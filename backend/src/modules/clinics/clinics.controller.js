// src/modules/clinics/clinics.controller.js - CONTROLLER
// ============================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');
// const logger = require('../../core/utils/logger');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, name, slug, contact_email, contact_number, status, created_at
       FROM vet_clinics
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit) }));
  } catch (err) {
    // logger.error('List clinics failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM vet_clinics WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0]));
  } catch (err) {
    // logger.error('Get clinic failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const create = async (req, res) => {
  try {
    const {
      name,
      slug,
      license_number,
      description,
      specializations,
      branch_id,
      contact_email,
      contact_number,
      emergency_number,
      status,
      is_emergency_available,
      is_24x7
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'name', msg: 'Name is required' }]
      });
    }

    if (!contact_email || !String(contact_email).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'contact_email', msg: 'Contact email is required' }]
      });
    }

    if (!contact_number || !String(contact_number).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'contact_number', msg: 'Contact number is required' }]
      });
    }

    const result = await query(
      `INSERT INTO vet_clinics (name, slug, license_number, description, specializations, branch_id, contact_email, contact_number, emergency_number, status, is_emergency_available, is_24x7, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, name, created_at`,
      [
        name,
        slug || null,
        license_number || null,
        description || null,
        specializations || null,
        branch_id || null,
        contact_email,
        contact_number,
        emergency_number || null,
        status === undefined ? 1 : status,
        is_emergency_available === undefined ? false : is_emergency_available,
        is_24x7 === undefined ? false : is_24x7,
        (req.user && req.user.id) || null
      ]
    );

    res.status(201).json(successResponse(result.rows[0], 'Created', 201));
  } catch (err) {
    // logger.error('Create clinic failed', { error: err.message });
    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({ status: 'error', message: isProd ? 'Failed to create' : `Failed to create: ${err.message}` });
  }
};

const update = async (req, res) => {
  try {
    const {
      name,
      slug,
      license_number,
      description,
      specializations,
      branch_id,
      contact_email,
      contact_number,
      emergency_number,
      status,
      is_emergency_available,
      is_24x7
    } = req.body;

    const statusParam = status === undefined ? null : Number(status);
    const isEmergencyParam = is_emergency_available === undefined ? null : (is_emergency_available === true || String(is_emergency_available) === '1' || String(is_emergency_available) === 'true');
    const is24x7Param = is_24x7 === undefined ? null : (is_24x7 === true || String(is_24x7) === '1' || String(is_24x7) === 'true');

    const result = await query(
      `UPDATE vet_clinics
       SET name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           license_number = COALESCE($4, license_number),
           description = COALESCE($5, description),
           specializations = COALESCE($6, specializations),
           branch_id = COALESCE($7, branch_id),
           contact_email = COALESCE($8, contact_email),
           contact_number = COALESCE($9, contact_number),
           emergency_number = COALESCE($10, emergency_number),
           status = COALESCE($11, status),
           is_emergency_available = COALESCE($12, is_emergency_available),
           is_24x7 = COALESCE($13, is_24x7)
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, updated_at`,
      [
        req.params.id,
        name === undefined ? null : name,
        slug === undefined ? null : slug,
        license_number === undefined ? null : license_number,
        description === undefined ? null : description,
        specializations === undefined ? null : specializations,
        branch_id === undefined ? null : branch_id,
        contact_email === undefined ? null : contact_email,
        contact_number === undefined ? null : contact_number,
        emergency_number === undefined ? null : emergency_number,
        statusParam,
        isEmergencyParam,
        is24x7Param
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0], 'Updated'));
  } catch (err) {
    // logger.error('Update clinic failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const delete_clinic = async (req, res) => {
  try {
    const result = await query(
      `UPDATE vet_clinics SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    // logger.error('Delete clinic failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, getById, create, update, delete: delete_clinic };
