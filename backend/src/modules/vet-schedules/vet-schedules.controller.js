// src/modules/vet-schedules/vet-schedules.controller.js - CONTROLLER
// ============================================================

const { query, transaction } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

// =================== SCHEDULES ===================

/**
 * GET /api/vet-schedules?veterinarian_id=&clinic_id=
 * List weekly schedules for a veterinarian, optionally filtered by clinic.
 */
const listSchedules = async (req, res) => {
  try {
    const { veterinarian_id, clinic_id } = req.query;

    if (!veterinarian_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'veterinarian_id', msg: 'veterinarian_id is required' }]
      });
    }

    let where = 'vs.veterinarian_id = $1';
    const params = [veterinarian_id];
    let paramIndex = 2;

    if (clinic_id) {
      where += ` AND vs.clinic_id = $${paramIndex}`;
      params.push(clinic_id);
      paramIndex++;
    }

    const result = await query(
      `SELECT vs.id, vs.veterinarian_id, vs.clinic_id, vs.day_of_week,
              vs.start_time, vs.end_time, vs.slot_duration, vs.max_appointments_per_slot,
              vs.is_available, vs.created_at, vs.updated_at,
              c.name AS clinic_name,
              u.first_name AS vet_first_name, u.last_name AS vet_last_name
       FROM vet_schedules vs
       LEFT JOIN vet_clinics c ON vs.clinic_id = c.id
       LEFT JOIN veterinarians v ON vs.veterinarian_id = v.id
       LEFT JOIN users u ON v.user_id = u.id
       WHERE ${where}
       ORDER BY vs.day_of_week, vs.start_time`,
      params
    );

    res.json(successResponse(result.rows));
  } catch (err) {
    console.error('List vet schedules error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch schedules' });
  }
};

/**
 * POST /api/vet-schedules
 * Create or update a single schedule slot.
 * If a schedule already exists for the same vet + clinic + day_of_week, update it; otherwise insert.
 */
const upsertSchedule = async (req, res) => {
  try {
    const {
      veterinarian_id,
      clinic_id,
      day_of_week,
      start_time,
      end_time,
      slot_duration = 30,
      max_appointments_per_slot = 1,
      is_available = true
    } = req.body;

    if (!veterinarian_id || !clinic_id || day_of_week === undefined || day_of_week === null || !start_time || !end_time) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'body', msg: 'veterinarian_id, clinic_id, day_of_week, start_time and end_time are required' }]
      });
    }

    // Check if a schedule already exists for this vet + clinic + day
    const existing = await query(
      `SELECT id FROM vet_schedules
       WHERE veterinarian_id = $1 AND clinic_id = $2 AND day_of_week = $3`,
      [veterinarian_id, clinic_id, day_of_week]
    );

    let result;

    if (existing.rows.length > 0) {
      // Update existing
      result = await query(
        `UPDATE vet_schedules
         SET start_time = $1, end_time = $2, slot_duration = $3,
             max_appointments_per_slot = $4, is_available = $5,
             updated_by = $6, updated_at = now()
         WHERE id = $7
         RETURNING *`,
        [
          start_time,
          end_time,
          slot_duration,
          max_appointments_per_slot,
          is_available,
          req.user?.id || null,
          existing.rows[0].id
        ]
      );
    } else {
      // Insert new
      result = await query(
        `INSERT INTO vet_schedules (
           veterinarian_id, clinic_id, day_of_week, start_time, end_time,
           slot_duration, max_appointments_per_slot, is_available, created_by, updated_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
         RETURNING *`,
        [
          veterinarian_id,
          clinic_id,
          day_of_week,
          start_time,
          end_time,
          slot_duration,
          max_appointments_per_slot,
          is_available,
          req.user?.id || null
        ]
      );
    }

    res.status(existing.rows.length > 0 ? 200 : 201).json(
      successResponse(result.rows[0], existing.rows.length > 0 ? 'Schedule updated' : 'Schedule created')
    );
  } catch (err) {
    console.error('Upsert vet schedule error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save schedule' });
  }
};

/**
 * PUT /api/vet-schedules/bulk
 * Bulk-set the weekly schedule for a vet at a clinic.
 * Deletes all existing schedules for the vet+clinic and inserts the new ones in a transaction.
 */
const bulkUpsertSchedules = async (req, res) => {
  try {
    const { veterinarian_id, clinic_id, schedules } = req.body;

    if (!veterinarian_id || !clinic_id || !Array.isArray(schedules)) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'body', msg: 'veterinarian_id, clinic_id and schedules[] are required' }]
      });
    }

    const rows = await transaction(async (client) => {
      // Delete old schedules for this vet + clinic
      await client.query(
        `DELETE FROM vet_schedules WHERE veterinarian_id = $1 AND clinic_id = $2`,
        [veterinarian_id, clinic_id]
      );

      const inserted = [];

      for (const s of schedules) {
        const {
          day_of_week,
          start_time,
          end_time,
          slot_duration = 30,
          max_appointments_per_slot = 1,
          is_available = true
        } = s;

        const insertResult = await client.query(
          `INSERT INTO vet_schedules (
             veterinarian_id, clinic_id, day_of_week, start_time, end_time,
             slot_duration, max_appointments_per_slot, is_available, created_by, updated_by
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
           RETURNING *`,
          [
            veterinarian_id,
            clinic_id,
            day_of_week,
            start_time,
            end_time,
            slot_duration,
            max_appointments_per_slot,
            is_available,
            req.user?.id || null
          ]
        );

        inserted.push(insertResult.rows[0]);
      }

      return inserted;
    });

    res.json(successResponse(rows, 'Schedules updated'));
  } catch (err) {
    console.error('Bulk upsert vet schedules error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save schedules' });
  }
};

/**
 * DELETE /api/vet-schedules/:id
 * Delete a single schedule by id.
 */
const deleteSchedule = async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM vet_schedules WHERE id = $1 RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Schedule not found' });
    }

    res.json(successResponse(null, 'Schedule deleted'));
  } catch (err) {
    console.error('Delete vet schedule error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete schedule' });
  }
};

// =================== EXCEPTIONS ===================

/**
 * GET /api/vet-schedules/exceptions?veterinarian_id=&clinic_id=&from_date=&to_date=
 * List schedule exceptions for a veterinarian.
 */
const listExceptions = async (req, res) => {
  try {
    const { veterinarian_id, clinic_id, from_date, to_date } = req.query;

    if (!veterinarian_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'veterinarian_id', msg: 'veterinarian_id is required' }]
      });
    }

    let where = 'e.veterinarian_id = $1';
    const params = [veterinarian_id];
    let paramIndex = 2;

    if (clinic_id) {
      where += ` AND e.clinic_id = $${paramIndex}`;
      params.push(clinic_id);
      paramIndex++;
    }

    if (from_date) {
      where += ` AND e.exception_date >= $${paramIndex}`;
      params.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      where += ` AND e.exception_date <= $${paramIndex}`;
      params.push(to_date);
      paramIndex++;
    }

    const result = await query(
      `SELECT e.id, e.veterinarian_id, e.clinic_id, e.exception_date, e.exception_type,
              e.start_time, e.end_time, e.reason, e.is_recurring,
              e.created_at, e.updated_at,
              c.name AS clinic_name
       FROM vet_schedule_exceptions e
       LEFT JOIN vet_clinics c ON e.clinic_id = c.id
       WHERE ${where}
       ORDER BY e.exception_date`,
      params
    );

    res.json(successResponse(result.rows));
  } catch (err) {
    console.error('List vet schedule exceptions error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exceptions' });
  }
};

/**
 * POST /api/vet-schedules/exceptions
 * Create a schedule exception (leave, holiday, etc.).
 */
const createException = async (req, res) => {
  try {
    const {
      veterinarian_id,
      clinic_id,
      exception_date,
      exception_type,
      start_time,
      end_time,
      reason,
      is_recurring = false
    } = req.body;

    if (!veterinarian_id || !exception_date || !exception_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'body', msg: 'veterinarian_id, exception_date and exception_type are required' }]
      });
    }

    const result = await query(
      `INSERT INTO vet_schedule_exceptions (
         veterinarian_id, clinic_id, exception_date, exception_type,
         start_time, end_time, reason, is_recurring, created_by, updated_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
       RETURNING *`,
      [
        veterinarian_id,
        clinic_id || null,
        exception_date,
        exception_type,
        start_time || null,
        end_time || null,
        reason || null,
        is_recurring,
        req.user?.id || null
      ]
    );

    res.status(201).json(successResponse(result.rows[0], 'Exception created', 201));
  } catch (err) {
    console.error('Create vet schedule exception error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create exception' });
  }
};

/**
 * DELETE /api/vet-schedules/exceptions/:id
 * Delete a schedule exception by id.
 */
const deleteException = async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM vet_schedule_exceptions WHERE id = $1 RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Exception not found' });
    }

    res.json(successResponse(null, 'Exception deleted'));
  } catch (err) {
    console.error('Delete vet schedule exception error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete exception' });
  }
};

module.exports = {
  listSchedules,
  upsertSchedule,
  bulkUpsertSchedules,
  deleteSchedule,
  listExceptions,
  createException,
  deleteException
};
