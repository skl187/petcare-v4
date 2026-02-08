// src/modules/medical-records/medical-records.controller.js
// ============================================================================
// Medical Records Controller
// ============================================================================

const { query, getConnection } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

// ============================================================================
// MEDICAL RECORDS LISTING & RETRIEVAL
// ============================================================================

const listMedicalRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, pet_id, veterinarian_id, record_type, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE mr.deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (pet_id) {
      where += ` AND mr.pet_id = $${paramIndex}`;
      params.push(pet_id);
      paramIndex++;
    }
    if (veterinarian_id) {
      where += ` AND mr.veterinarian_id = $${paramIndex}`;
      params.push(veterinarian_id);
      paramIndex++;
    }
    if (record_type) {
      where += ` AND mr.record_type = $${paramIndex}`;
      params.push(record_type);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND mr.record_date >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND mr.record_date <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT mr.id, mr.appointment_id, mr.pet_id, mr.record_type, mr.record_date,
              mr.diagnosis, mr.followup_required, mr.followup_date,
              p.name as pet_name,
              vu.first_name as vet_first_name, vu.last_name as vet_last_name
       FROM vet_medical_records mr
       LEFT JOIN pets p ON mr.pet_id = p.id
       LEFT JOIN veterinarians v ON mr.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       ${where}
       ORDER BY mr.record_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_medical_records mr ${where}`,
      params.slice(0, -2)
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch medical records' });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT mr.*, 
              p.name as pet_name, p.date_of_birth as pet_dob,
              vu.first_name as vet_first_name, vu.last_name as vet_last_name, v.specialization,
              a.appointment_number
       FROM vet_medical_records mr
       LEFT JOIN pets p ON mr.pet_id = p.id
       LEFT JOIN veterinarians v ON mr.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN vet_appointments a ON mr.appointment_id = a.id
       WHERE mr.id = $1 AND mr.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Medical record not found' });
    }

    const record = result.rows[0];

    // Fetch related prescriptions
    const prescriptions = await query(
      `SELECT * FROM vet_prescriptions WHERE medical_record_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    // Fetch related lab tests
    const labTests = await query(
      `SELECT * FROM vet_lab_tests WHERE medical_record_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    res.json(successResponse({
      ...record,
      prescriptions: prescriptions.rows,
      lab_tests: labTests.rows
    }));
  } catch (err) {
    console.error('getMedicalRecordById error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch medical record' });
  }
};


const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      symptoms,
      vital_signs,
      physical_examination,
      treatment_plan,
      recommendations,
      followup_required,
      followup_date,
      notes
    } = req.body;

    let setFields = [];
    const params = [id];
    let paramIndex = 2;

    if (diagnosis !== undefined) {
      setFields.push(`diagnosis = $${paramIndex}`);
      params.push(diagnosis);
      paramIndex++;
    }
    if (symptoms !== undefined) {
      setFields.push(`symptoms = $${paramIndex}`);
      params.push(symptoms ? JSON.stringify(symptoms) : null);
      paramIndex++;
    }
    if (vital_signs !== undefined) {
      setFields.push(`vital_signs = $${paramIndex}`);
      params.push(vital_signs ? JSON.stringify(vital_signs) : null);
      paramIndex++;
    }
    if (physical_examination !== undefined) {
      setFields.push(`physical_examination = $${paramIndex}`);
      params.push(physical_examination);
      paramIndex++;
    }
    if (treatment_plan !== undefined) {
      setFields.push(`treatment_plan = $${paramIndex}`);
      params.push(treatment_plan);
      paramIndex++;
    }
    if (recommendations !== undefined) {
      setFields.push(`recommendations = $${paramIndex}`);
      params.push(recommendations);
      paramIndex++;
    }
    if (followup_required !== undefined) {
      setFields.push(`followup_required = $${paramIndex}`);
      params.push(followup_required);
      paramIndex++;
    }
    if (followup_date !== undefined) {
      setFields.push(`followup_date = $${paramIndex}`);
      params.push(followup_date);
      paramIndex++;
    }
    if (notes !== undefined) {
      setFields.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (setFields.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    setFields.push(`updated_by = $${paramIndex}`);
    params.push(req.user?.id || null);

    const result = await query(
      `UPDATE vet_medical_records
       SET ${setFields.join(', ')}
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Medical record not found' });
    }

    res.json(successResponse(result.rows[0], 'Medical record updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update medical record' });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE vet_medical_records SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Medical record not found' });
    }

    res.json(successResponse(null, 'Medical record deleted'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete medical record' });
  }
};

// Follow-ups list (upcoming followups)
const listFollowUps = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT mr.id, mr.appointment_id, mr.pet_id, mr.record_date, mr.followup_required, mr.followup_date,
              p.name as pet_name, vu.first_name as vet_first_name, vu.last_name as vet_last_name
       FROM vet_medical_records mr
       LEFT JOIN pets p ON mr.pet_id = p.id
       LEFT JOIN veterinarians v ON mr.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       WHERE mr.deleted_at IS NULL AND (mr.followup_required = true OR (mr.followup_date IS NOT NULL AND mr.followup_date >= CURRENT_DATE))
       ORDER BY COALESCE(mr.followup_date, mr.record_date) ASC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_medical_records mr WHERE mr.deleted_at IS NULL AND (mr.followup_required = true OR (mr.followup_date IS NOT NULL AND mr.followup_date >= CURRENT_DATE))`
    );

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].total) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch follow-ups' });
  }
};

const listFollowUpsForVet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const vetRes = await query('SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    if (vetRes.rows.length === 0) return res.status(403).json({ status: 'error', message: 'Not a veterinarian' });
    const veterinarian_id = vetRes.rows[0].id;

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT mr.id, mr.appointment_id, mr.pet_id, mr.record_date, mr.followup_required, mr.followup_date,
              p.name as pet_name
       FROM vet_medical_records mr
       LEFT JOIN pets p ON mr.pet_id = p.id
       WHERE mr.deleted_at IS NULL AND (mr.followup_required = true OR (mr.followup_date IS NOT NULL AND mr.followup_date >= CURRENT_DATE)) AND mr.veterinarian_id = $1
       ORDER BY COALESCE(mr.followup_date, mr.record_date) ASC
       LIMIT $2 OFFSET $3`,
      [veterinarian_id, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_medical_records mr WHERE mr.deleted_at IS NULL AND (mr.followup_required = true OR (mr.followup_date IS NOT NULL AND mr.followup_date >= CURRENT_DATE)) AND mr.veterinarian_id = $1`,
      [veterinarian_id]
    );

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].total) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch vet follow-ups' });
  }
};

// Add Medical records for an appointment

const createMedicalRecord = async (req, res) => {
  const client = await getConnection();
  try {
    await client.query('BEGIN');

    const userId = req.user?.id;
    if (!userId) {
      await client.query('ROLLBACK');
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const {
      appointment_id,
      pet_id,
      veterinarian_id,
      record_type,
      diagnosis,
      symptoms,
      vital_signs,
      physical_examination,
      treatment_plan,
      recommendations,
      followup_required = false,
      followup_date,
      notes,
      is_confidential = false
    } = req.body;

    // Validation - appointment_id, pet_id, record_type are required
    if (!appointment_id || !pet_id || !record_type) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [
          { param: 'appointment_id', msg: 'Required' },
          { param: 'pet_id', msg: 'Required' },
          { param: 'record_type', msg: 'Required' }
        ]
      });
    }

    // If veterinarian_id not provided, try to get it from authenticated user
    let finalVetId = veterinarian_id;
    if (!finalVetId) {
      const vetRes = await client.query(
        'SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL',
        [userId]
      );
      if (vetRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ status: 'error', message: 'User is not a registered veterinarian' });
      }
      finalVetId = vetRes.rows[0].id;
    } else {
      // Validate that the provided veterinarian_id exists
      const vetCheckRes = await client.query(
        'SELECT id FROM veterinarians WHERE id = $1 AND deleted_at IS NULL',
        [finalVetId]
      );
      if (vetCheckRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ status: 'error', message: 'Invalid veterinarian_id: veterinarian not found' });
      }
    }

    const result = await client.query(
      `INSERT INTO vet_medical_records (
        appointment_id, pet_id, veterinarian_id, record_date, record_type,
        diagnosis, symptoms, vital_signs, physical_examination,
        treatment_plan, recommendations, followup_required, followup_date,
        notes, is_confidential, created_by
      )
      VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, record_date`,
      [
        appointment_id, pet_id, finalVetId, record_type,
        diagnosis || null,
        symptoms ? JSON.stringify(symptoms) : null,
        vital_signs ? JSON.stringify(vital_signs) : null,
        physical_examination || null,
        treatment_plan || null,
        recommendations || null,
        followup_required,
        followup_date || null,
        notes || null,
        is_confidential,
        userId
      ]
    );

    await client.query('COMMIT');

    res.status(201).json(successResponse({
      id: result.rows[0].id,
      record_type,
      record_date: result.rows[0].record_date
    }, 'Medical record created', 201));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create medical record error:', err.message);
    res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'production' ? 'Failed to create medical record' : err.message
    });
  } finally {
    client.release();
  }
};



module.exports = {
  listMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  listFollowUps,
  listFollowUpsForVet,
  createMedicalRecord
};