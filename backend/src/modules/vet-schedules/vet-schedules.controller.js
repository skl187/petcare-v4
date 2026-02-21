const { query, transaction } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

// ─────────────────────────────────────────────
// Helper: resolve veterinarian id from user id
// ─────────────────────────────────────────────
const getVetId = async (userId) => {
  const { rows } = await query(
    `SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL LIMIT 1`,
    [userId]
  );
  return rows[0]?.id || null;
};

// ═══════════════════════════════════════════════════════════
// WEEKLY SCHEDULES
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/vet-schedules/my?clinic_id=
 * Vet fetches their own weekly schedule, optionally filtered by clinic.
 */
const getMySchedules = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const { clinic_id } = req.query;
    const conditions = ['vs.veterinarian_id = $1', 'vs.deleted_at IS NULL'];
    const params = [vetId];

    if (clinic_id) {
      params.push(clinic_id);
      conditions.push(`vs.clinic_id = $${params.length}`);
    }

    const { rows } = await query(
      `SELECT vs.id, vs.veterinarian_id, vs.clinic_id, vs.day_of_week,
              vs.start_time, vs.end_time, vs.slot_duration,
              vs.max_appointments_per_slot, vs.is_available,
              vs.created_at, vs.updated_at,
              vc.name AS clinic_name
       FROM vet_schedules vs
       LEFT JOIN vet_clinics vc ON vs.clinic_id = vc.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY vs.clinic_id, vs.day_of_week, vs.start_time`,
      params
    );

    res.json(successResponse(rows));
  } catch (err) {
    console.error('getMySchedules error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch schedules' });
  }
};

/**
 * GET /api/vet-schedules?veterinarian_id=&clinic_id=
 * Admin fetches schedules for any vet.
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

    const conditions = ['vs.veterinarian_id = $1', 'vs.deleted_at IS NULL'];
    const params = [veterinarian_id];

    if (clinic_id) {
      params.push(clinic_id);
      conditions.push(`vs.clinic_id = $${params.length}`);
    }

    const { rows } = await query(
      `SELECT vs.id, vs.veterinarian_id, vs.clinic_id, vs.day_of_week,
              vs.start_time, vs.end_time, vs.slot_duration,
              vs.max_appointments_per_slot, vs.is_available,
              vs.created_at, vs.updated_at,
              vc.name AS clinic_name,
              u.first_name || ' ' || u.last_name AS vet_name
       FROM vet_schedules vs
       LEFT JOIN vet_clinics vc ON vs.clinic_id = vc.id
       LEFT JOIN veterinarians v ON vs.veterinarian_id = v.id
       LEFT JOIN users u ON v.user_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY vs.day_of_week, vs.start_time`,
      params
    );

    res.json(successResponse(rows));
  } catch (err) {
    console.error('listSchedules error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch schedules' });
  }
};

/**
 * PUT /api/vet-schedules/bulk
 * Save Schedule button — replaces entire weekly schedule for vet+clinic in one transaction.
 * Body: { clinic_id, schedules: [{ day_of_week, start_time, end_time, slot_duration, max_appointments_per_slot, is_available }] }
 */
const bulkUpsertSchedules = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    let { clinic_id, schedules } = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'schedules', msg: 'schedules[] is required and must not be empty' }]
      });
    }

    // Auto-resolve clinic_id from vet primary mapping if not sent by frontend
    if (!clinic_id) {
      const { rows: clinics } = await query(
        `SELECT clinic_id FROM vet_clinic_mappings
         WHERE veterinarian_id = $1 AND deleted_at IS NULL
         ORDER BY is_primary DESC, created_at ASC
         LIMIT 1`,
        [vetId]
      );
      if (!clinics.length) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: [{ param: 'clinic_id', msg: 'No clinic mapping found. Please provide clinic_id.' }]
        });
      }
      clinic_id = clinics[0].clinic_id;
    }

    // Validate each schedule row
    for (const s of schedules) {
      if (s.day_of_week === undefined || s.day_of_week === null || !s.start_time || !s.end_time) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: [{ param: 'schedules', msg: 'Each schedule must have day_of_week, start_time, and end_time' }]
        });
      }
    }

    const rows = await transaction(async (client) => {
      // Wipe existing schedules for this vet + clinic
      await client.query(
        `DELETE FROM vet_schedules WHERE veterinarian_id = $1 AND clinic_id = $2`,
        [vetId, clinic_id]
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

        const { rows: r } = await client.query(
          `INSERT INTO vet_schedules (
             veterinarian_id, clinic_id, day_of_week, start_time, end_time,
             slot_duration, max_appointments_per_slot, is_available, created_by, updated_by
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
           RETURNING *`,
          [
            vetId, clinic_id, day_of_week, start_time, end_time,
            slot_duration, max_appointments_per_slot, is_available,
            req.user.id
          ]
        );

        inserted.push(r[0]);
      }

      return inserted;
    });

    res.json(successResponse(rows, 'Schedule saved'));
  } catch (err) {
    console.error('bulkUpsertSchedules error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save schedule' });
  }
};

/**
 * POST /api/vet-schedules
 * Upsert a single day's schedule for the authenticated vet.
 * Body: { clinic_id, day_of_week, start_time, end_time, slot_duration, max_appointments_per_slot, is_available }
 */
const upsertSchedule = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const {
      clinic_id,
      day_of_week,
      start_time,
      end_time,
      slot_duration = 30,
      max_appointments_per_slot = 1,
      is_available = true
    } = req.body;

    if (!clinic_id || day_of_week === undefined || day_of_week === null || !start_time || !end_time) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'body', msg: 'clinic_id, day_of_week, start_time and end_time are required' }]
      });
    }

    // Check existing
    const { rows: existing } = await query(
      `SELECT id FROM vet_schedules
       WHERE veterinarian_id = $1 AND clinic_id = $2 AND day_of_week = $3 AND deleted_at IS NULL`,
      [vetId, clinic_id, day_of_week]
    );

    let result;
    let isUpdate = existing.length > 0;

    if (isUpdate) {
      const { rows } = await query(
        `UPDATE vet_schedules
         SET start_time = $1, end_time = $2, slot_duration = $3,
             max_appointments_per_slot = $4, is_available = $5,
             updated_by = $6, updated_at = now()
         WHERE id = $7
         RETURNING *`,
        [start_time, end_time, slot_duration, max_appointments_per_slot, is_available, req.user.id, existing[0].id]
      );
      result = rows[0];
    } else {
      const { rows } = await query(
        `INSERT INTO vet_schedules (
           veterinarian_id, clinic_id, day_of_week, start_time, end_time,
           slot_duration, max_appointments_per_slot, is_available, created_by, updated_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
         RETURNING *`,
        [vetId, clinic_id, day_of_week, start_time, end_time, slot_duration, max_appointments_per_slot, is_available, req.user.id]
      );
      result = rows[0];
    }

    res.status(isUpdate ? 200 : 201).json(
      successResponse(result, isUpdate ? 'Schedule updated' : 'Schedule created')
    );
  } catch (err) {
    console.error('upsertSchedule error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save schedule' });
  }
};

/**
 * PATCH /api/vet-schedules/:id
 * Toggle availability or update a single field without full replacement.
 */
const updateSchedule = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const { id } = req.params;
    const { start_time, end_time, slot_duration, max_appointments_per_slot, is_available } = req.body;

    // Ownership check
    const { rows: ownerCheck } = await query(
      `SELECT id FROM vet_schedules WHERE id = $1 AND veterinarian_id = $2 AND deleted_at IS NULL`,
      [id, vetId]
    );

    if (!ownerCheck.length) {
      return res.status(404).json({ status: 'error', message: 'Schedule not found or access denied' });
    }

    const { rows } = await query(
      `UPDATE vet_schedules
       SET start_time               = COALESCE($1, start_time),
           end_time                 = COALESCE($2, end_time),
           slot_duration            = COALESCE($3, slot_duration),
           max_appointments_per_slot = COALESCE($4, max_appointments_per_slot),
           is_available             = COALESCE($5, is_available),
           updated_by               = $6,
           updated_at               = now()
       WHERE id = $7
       RETURNING *`,
      [start_time, end_time, slot_duration, max_appointments_per_slot, is_available, req.user.id, id]
    );

    res.json(successResponse(rows[0], 'Schedule updated'));
  } catch (err) {
    console.error('updateSchedule error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update schedule' });
  }
};

/**
 * DELETE /api/vet-schedules/:id
 * Soft-delete a single schedule.
 */
const deleteSchedule = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const { rows } = await query(
      `UPDATE vet_schedules SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND veterinarian_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [req.params.id, vetId]
    );

    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'Schedule not found or access denied' });
    }

    res.json(successResponse(null, 'Schedule deleted'));
  } catch (err) {
    console.error('deleteSchedule error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete schedule' });
  }
};

// ═══════════════════════════════════════════════════════════
// SCHEDULE EXCEPTIONS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/vet-schedules/exceptions/my?clinic_id=&from_date=&to_date=
 * Vet fetches their own exceptions.
 */
const getMyExceptions = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const { clinic_id, from_date, to_date } = req.query;

    const conditions = ['e.veterinarian_id = $1'];
    const params = [vetId];

    if (clinic_id) {
      params.push(clinic_id);
      // include exceptions for this clinic OR global ones (clinic_id IS NULL)
      conditions.push(`(e.clinic_id = $${params.length} OR e.clinic_id IS NULL)`);
    }
    if (from_date) {
      params.push(from_date);
      conditions.push(`e.exception_date >= $${params.length}`);
    }
    if (to_date) {
      params.push(to_date);
      conditions.push(`e.exception_date <= $${params.length}`);
    }

    const { rows } = await query(
      `SELECT e.id, e.veterinarian_id, e.clinic_id, e.exception_date::text AS exception_date, e.exception_type,
              e.start_time, e.end_time, e.reason, e.is_recurring,
              e.created_at, e.updated_at,
              vc.name AS clinic_name
       FROM vet_schedule_exceptions e
       LEFT JOIN vet_clinics vc ON e.clinic_id = vc.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY e.exception_date`,
      params
    );

    res.json(successResponse(rows));
  } catch (err) {
    console.error('getMyExceptions error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exceptions' });
  }
};

/**
 * GET /api/vet-schedules/exceptions?veterinarian_id=&clinic_id=&from_date=&to_date=
 * Admin fetches exceptions for any vet.
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

    const conditions = ['e.veterinarian_id = $1'];
    const params = [veterinarian_id];

    if (clinic_id) {
      params.push(clinic_id);
      // include exceptions specific to this clinic OR global exceptions (clinic_id IS NULL)
      conditions.push(`(e.clinic_id = $${params.length} OR e.clinic_id IS NULL)`);
    }
    if (from_date) {
      params.push(from_date);
      conditions.push(`e.exception_date >= $${params.length}`);
    }
    if (to_date) {
      params.push(to_date);
      conditions.push(`e.exception_date <= $${params.length}`);
    }

    const { rows } = await query(
      `SELECT e.id, e.veterinarian_id, e.clinic_id, e.exception_date::text AS exception_date, e.exception_type,
              e.start_time, e.end_time, e.reason, e.is_recurring,
              e.created_at, e.updated_at,
              vc.name AS clinic_name,
              u.first_name || ' ' || u.last_name AS vet_name
       FROM vet_schedule_exceptions e
       LEFT JOIN vet_clinics vc ON e.clinic_id = vc.id
       LEFT JOIN veterinarians v ON e.veterinarian_id = v.id
       LEFT JOIN users u ON v.user_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY e.exception_date`,
      params
    );

    res.json(successResponse(rows));
  } catch (err) {
    console.error('listExceptions error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exceptions' });
  }
};

/**
 * POST /api/vet-schedules/exceptions
 * Vet creates an exception (leave, holiday, etc.).
 * Body: { clinic_id?, exception_date, exception_type, start_time?, end_time?, reason?, is_recurring? }
 */
const createException = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const {
      clinic_id,
      exception_date,
      exception_type,
      start_time,
      end_time,
      reason,
      is_recurring = false
    } = req.body;

    if (!exception_date || !exception_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'body', msg: 'exception_date and exception_type are required' }]
      });
    }

    const validTypes = ['leave', 'holiday', 'emergency', 'conference', 'other'];
    if (!validTypes.includes(exception_type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'exception_type', msg: `Must be one of: ${validTypes.join(', ')}` }]
      });
    }

    const { rows } = await query(
      `INSERT INTO vet_schedule_exceptions (
         veterinarian_id, clinic_id, exception_date, exception_type,
         start_time, end_time, reason, is_recurring, created_by, updated_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
       RETURNING *`,
      [
        vetId,
        clinic_id || null,
        exception_date,
        exception_type,
        start_time || null,
        end_time || null,
        reason || null,
        is_recurring,
        req.user.id
      ]
    );

    res.status(201).json(successResponse(rows[0], 'Exception created'));
  } catch (err) {
    console.error('createException error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create exception' });
  }
};

/**
 * PATCH /api/vet-schedules/exceptions/:id
 * Vet updates their own exception.
 */
const updateException = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const { id } = req.params;
    const { exception_date, exception_type, start_time, end_time, reason, is_recurring, clinic_id } = req.body;

    if (exception_type) {
      const validTypes = ['leave', 'holiday', 'emergency', 'conference', 'other'];
      if (!validTypes.includes(exception_type)) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: [{ param: 'exception_type', msg: `Must be one of: ${validTypes.join(', ')}` }]
        });
      }
    }

    // Ownership check
    const { rows: ownerCheck } = await query(
      `SELECT id FROM vet_schedule_exceptions WHERE id = $1 AND veterinarian_id = $2`,
      [id, vetId]
    );

    if (!ownerCheck.length) {
      return res.status(404).json({ status: 'error', message: 'Exception not found or access denied' });
    }

    const { rows } = await query(
      `UPDATE vet_schedule_exceptions
       SET exception_date  = COALESCE($1, exception_date),
           exception_type  = COALESCE($2, exception_type),
           start_time      = COALESCE($3, start_time),
           end_time        = COALESCE($4, end_time),
           reason          = COALESCE($5, reason),
           is_recurring    = COALESCE($6, is_recurring),
           clinic_id       = COALESCE($7, clinic_id),
           updated_by      = $8,
           updated_at      = now()
       WHERE id = $9
       RETURNING *`,
      [exception_date, exception_type, start_time, end_time, reason, is_recurring, clinic_id, req.user.id, id]
    );

    res.json(successResponse(rows[0], 'Exception updated'));
  } catch (err) {
    console.error('updateException error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update exception' });
  }
};

/**
 * DELETE /api/vet-schedules/exceptions/:id
 * Vet deletes their own exception.
 */
const deleteException = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ status: 'error', message: 'Vet profile not found' });

    const { rows } = await query(
      `DELETE FROM vet_schedule_exceptions WHERE id = $1 AND veterinarian_id = $2 RETURNING id`,
      [req.params.id, vetId]
    );

    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'Exception not found or access denied' });
    }

    res.json(successResponse(null, 'Exception deleted'));
  } catch (err) {
    console.error('deleteException error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete exception' });
  }
};

module.exports = {
  // Schedules
  getMySchedules,
  listSchedules,
  bulkUpsertSchedules,
  upsertSchedule,
  updateSchedule,
  deleteSchedule,
  // Exceptions
  getMyExceptions,
  listExceptions,
  createException,
  updateException,
  deleteException
};