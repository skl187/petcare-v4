
// ============================================================================
// PRESCRIPTIONS
// ============================================================================
// Add Medical Prescriptions for an appointment


const { query, getConnection } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');


const createPrescription = async (req, res) => {
  const client = await getConnection();
  try {
    await client.query('BEGIN');

    const userId = req.user?.id;
    if (!userId) {
      await client.query('ROLLBACK');
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const {
      medical_record_id,
      appointment_id,
      pet_id,
      veterinarian_id,
      valid_until,
      notes,
      medications = []
    } = req.body;

    if (!medical_record_id || !appointment_id || !pet_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
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

    // Generate prescription number
    const numResult = await client.query(
      `SELECT COUNT(*) + 1 as next_num FROM vet_prescriptions`
    );
    const prescriptionNumber = `RX-${Date.now()}-${numResult.rows[0].next_num}`;

    const result = await client.query(
      `INSERT INTO vet_prescriptions (
        medical_record_id, appointment_id, pet_id, veterinarian_id,
        prescription_number, prescription_date, valid_until, notes, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, now()::date, $6, $7, 'active', $8)
      RETURNING id`,
      [medical_record_id, appointment_id, pet_id, finalVetId, prescriptionNumber, valid_until || null, notes || null, userId]
    );

    const prescriptionId = result.rows[0].id;

    // Insert medications
    for (const med of medications) {
      await client.query(
        `INSERT INTO vet_prescription_medications (
          prescription_id, medication_name, dosage, frequency, duration, route, instructions, quantity, refills_allowed
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [prescriptionId, med.medication_name, med.dosage, med.frequency, med.duration, med.route || null, med.instructions || null, med.quantity || null, med.refills_allowed || 0]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(successResponse({
      id: prescriptionId,
      prescription_number: prescriptionNumber,
      status: 'active'
    }, 'Prescription created', 201));

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: 'Failed to create prescription' });
  } finally {
    client.release();
  }
};

const listPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, pet_id, status, veterinarian_id } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE vp.deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (pet_id) {
      where += ` AND vp.pet_id = $${paramIndex}`;
      params.push(pet_id);
      paramIndex++;
    }
    if (status) {
      where += ` AND vp.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (veterinarian_id) {
      where += ` AND vp.veterinarian_id = $${paramIndex}`;
      params.push(veterinarian_id);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT vp.id, vp.prescription_number, vp.prescription_date, vp.valid_until,
              vp.status, p.name as pet_name,
              vu.first_name as vet_first_name, vu.last_name as vet_last_name
       FROM vet_prescriptions vp
       LEFT JOIN pets p ON vp.pet_id = p.id
       LEFT JOIN veterinarians v ON vp.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       ${where}
       ORDER BY vp.prescription_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_prescriptions vp ${where}`,
      params.slice(0, -2)
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch prescriptions' });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT vp.*, p.name as pet_name, vu.first_name as vet_first_name, vu.last_name as vet_last_name
       FROM vet_prescriptions vp
       LEFT JOIN pets p ON vp.pet_id = p.id
       LEFT JOIN veterinarians v ON vp.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       WHERE vp.id = $1 AND vp.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Prescription not found' });
    }

    const prescription = result.rows[0];

    // Fetch medications
    const medications = await query(
      `SELECT * FROM vet_prescription_medications WHERE prescription_id = $1`,
      [id]
    );

    res.json(successResponse({
      ...prescription,
      medications: medications.rows
    }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch prescription' });
  }
};

const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'completed', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const result = await query(
      `UPDATE vet_prescriptions SET status = $2, updated_by = $3 WHERE id = $1 AND deleted_at IS NULL RETURNING id, status`,
      [id, status, req.user?.id || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Prescription not found' });
    }

    res.json(successResponse(result.rows[0], 'Prescription status updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update prescription' });
  }
};

// Add/update medications to existing prescription
const updatePrescriptionMedications = async (req, res) => {
  const client = await getConnection();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { medications = [] } = req.body;

    // Verify prescription exists
    const prescriptionCheck = await client.query(
      `SELECT id, medical_record_id FROM vet_prescriptions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (prescriptionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Prescription not found' });
    }

    if (!Array.isArray(medications) || medications.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'medications must be a non-empty array' });
    }

    // Validate each medication has required fields
    const invalidMeds = medications.filter(med => !med.medication_name || !med.dosage || !med.frequency || !med.duration);
    if (invalidMeds.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'error', message: 'All medications must have medication_name, dosage, frequency, and duration' });
    }

    // Insert new medications
    const createdMedications = [];
    for (const med of medications) {
      const result = await client.query(
        `INSERT INTO vet_prescription_medications (
          prescription_id, medication_name, dosage, frequency, duration, route, instructions, quantity, refills_allowed
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, medication_name, dosage, frequency, duration`,
        [id, med.medication_name, med.dosage, med.frequency, med.duration, med.route || null, med.instructions || null, med.quantity || null, med.refills_allowed || 0]
      );
      createdMedications.push(result.rows[0]);
    }

    // Fetch all medications for this prescription
    const allMeds = await client.query(
      `SELECT * FROM vet_prescription_medications WHERE prescription_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    await client.query('COMMIT');

    res.json(successResponse({
      prescription_id: id,
      added_count: createdMedications.length,
      added_medications: createdMedications,
      total_medications: allMeds.rows.length
    }, `${createdMedications.length} medication(s) added to prescription`));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update prescription medications error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update prescription medications' });
  } finally {
    client.release();
  }
};

// Active prescriptions (convenience)
const listActivePrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const params = ['active', parseInt(limit), parseInt(offset)];

    const result = await query(
      `SELECT vp.id, vp.prescription_number, vp.prescription_date, vp.valid_until, vp.status, p.name as pet_name,
              vu.first_name as vet_first_name, vu.last_name as vet_last_name
       FROM vet_prescriptions vp
       LEFT JOIN pets p ON vp.pet_id = p.id
       LEFT JOIN veterinarians v ON vp.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       WHERE vp.deleted_at IS NULL AND vp.status = $1
       ORDER BY vp.prescription_date DESC
       LIMIT $2 OFFSET $3`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) as total FROM vet_prescriptions vp WHERE vp.deleted_at IS NULL AND vp.status = $1`, ['active']);

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].total) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch active prescriptions' });
  }
};

const listActivePrescriptionsForVet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const vetRes = await query('SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    if (vetRes.rows.length === 0) return res.status(403).json({ status: 'error', message: 'Not a veterinarian' });
    const veterinarian_id = vetRes.rows[0].id;

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT vp.id, vp.prescription_number, vp.prescription_date, vp.valid_until, vp.status, p.name as pet_name
       FROM vet_prescriptions vp
       LEFT JOIN pets p ON vp.pet_id = p.id
       WHERE vp.deleted_at IS NULL AND vp.status = 'active' AND vp.veterinarian_id = $1
       ORDER BY vp.prescription_date DESC
       LIMIT $2 OFFSET $3`,
      [veterinarian_id, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(`SELECT COUNT(*) as total FROM vet_prescriptions WHERE deleted_at IS NULL AND status = 'active' AND veterinarian_id = $1`, [veterinarian_id]);

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].total) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch vet active prescriptions' });
  }
};

// Delete prescription and cascade delete all associated medications
const deletePrescription = async (req, res) => {
  const client = await getConnection();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Verify prescription exists
    const prescriptionCheck = await client.query(
      `SELECT id FROM vet_prescriptions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (prescriptionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Prescription not found' });
    }

    // Delete all medications associated with this prescription
    await client.query(
      `DELETE FROM vet_prescription_medications WHERE prescription_id = $1`,
      [id]
    );

    // Soft delete the prescription
    const result = await client.query(
      `UPDATE vet_prescriptions SET deleted_at = now(), updated_by = $2 WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id, req.user?.id || null]
    );

    await client.query('COMMIT');

    res.json(successResponse(null, 'Prescription and associated medications deleted'));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete prescription error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete prescription' });
  } finally {
    client.release();
  }
};



module.exports = {
  listPrescriptions,
  createPrescription,
  getPrescriptionById,
  updatePrescriptionStatus,
  updatePrescriptionMedications,
  deletePrescription,
  listActivePrescriptions,
  listActivePrescriptionsForVet
};