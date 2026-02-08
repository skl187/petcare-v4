
// ============================================================================
// VACCINATIONS Controller
// ============================================================================
const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

const listVaccinations = async (req, res) => {
  try {
    const { page = 1, limit = 10, pet_id, veterinarian_id, vaccine_type } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE vv.deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (pet_id) {
      where += ` AND vv.pet_id = $${paramIndex}`;
      params.push(pet_id);
      paramIndex++;
    }
    if (veterinarian_id) {
      where += ` AND vv.veterinarian_id = $${paramIndex}`;
      params.push(veterinarian_id);
      paramIndex++;
    }
    if (vaccine_type) {
      where += ` AND vv.vaccine_type = $${paramIndex}`;
      params.push(vaccine_type);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT vv.id, vv.vaccine_name, vv.vaccine_type, vv.vaccination_date, vv.next_due_date,
              vv.certificate_issued, vv.cost,
              p.name as pet_name, vu.first_name as vet_first_name, vu.last_name as vet_last_name
       FROM vet_vaccinations vv
       LEFT JOIN pets p ON vv.pet_id = p.id
       LEFT JOIN veterinarians v ON vv.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       ${where}
       ORDER BY vv.vaccination_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_vaccinations vv ${where}`,
      params.slice(0, -2)
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch vaccinations' });
  }
};

const getVaccinationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT vv.*, p.name as pet_name, vu.first_name as vet_first_name, vu.last_name as vet_last_name
       FROM vet_vaccinations vv
       LEFT JOIN pets p ON vv.pet_id = p.id
       LEFT JOIN veterinarians v ON vv.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       WHERE vv.id = $1 AND vv.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Vaccination record not found' });
    }

    res.json(successResponse(result.rows[0]));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch vaccination' });
  }
};

// Get all vaccinations for a medical record (derived via pet_id and appointment_id)
const getVaccinationsByMedicalRecordId = async (req, res) => {
  try {
    const { medical_record_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!medical_record_id) {
      return res.status(400).json({ status: 'error', message: 'Missing required parameter: medical_record_id' });
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(medical_record_id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid medical_record_id' });
    }

    // Verify medical record exists and obtain pet_id + appointment_id
    const recordCheck = await query(
      `SELECT id, pet_id, appointment_id FROM vet_medical_records WHERE id = $1 AND deleted_at IS NULL`,
      [medical_record_id]
    );

    if (recordCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Medical record not found' });
    }

    const finalPetId = recordCheck.rows[0].pet_id;
    const finalAppointmentId = recordCheck.rows[0].appointment_id;

    const result = await query(
      `SELECT id, vaccine_name, vaccine_type, vaccination_date, next_due_date, manufacturer, batch_number, site_of_injection, adverse_reactions, cost, notes
       FROM vet_vaccinations
       WHERE pet_id = $1 AND appointment_id = $2 AND deleted_at IS NULL
       ORDER BY vaccination_date DESC
       LIMIT $3 OFFSET $4`,
      [finalPetId, finalAppointmentId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_vaccinations WHERE pet_id = $1 AND appointment_id = $2 AND deleted_at IS NULL`,
      [finalPetId, finalAppointmentId]
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    console.error('Get vaccinations by medical record error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch vaccinations' });
  }
};

const createVaccination = async (req, res) => {
  try {
    const {
      pet_id,
      appointment_id,
      veterinarian_id,
      vaccinations = []
    } = req.body;

    // Validation
    if (!pet_id || !appointment_id) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields: pet_id, appointment_id' });
    }

    if (!Array.isArray(vaccinations) || vaccinations.length === 0) {
      return res.status(400).json({ status: 'error', message: 'vaccinations must be a non-empty array' });
    }

    // Validate each vaccination has vaccine_name
    const invalidVaccines = vaccinations.filter(vaccine => !vaccine.vaccine_name);
    if (invalidVaccines.length > 0) {
      return res.status(400).json({ status: 'error', message: 'All vaccinations must have vaccine_name' });
    }

    // Determine and validate veterinarian_id
    let finalVeterinarianId = veterinarian_id;

    // If caller provided a veterinarian_id, validate it exists
    if (finalVeterinarianId) {
      const vetCheck = await query(
        `SELECT id FROM veterinarians WHERE id = $1 AND deleted_at IS NULL`,
        [finalVeterinarianId]
      );
      if (vetCheck.rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid veterinarian_id' });
      }
    } else {
      // Derive from authenticated user
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }
      const vetResult = await query(
        `SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL`,
        [userId]
      );
      if (vetResult.rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Authenticated user is not a veterinarian' });
      }
      finalVeterinarianId = vetResult.rows[0].id;
    }

    // Batch insert all vaccinations
    const createdVaccinations = [];

    for (const vaccine of vaccinations) {
      const result = await query(
        `INSERT INTO vet_vaccinations (
          pet_id, appointment_id, veterinarian_id, vaccine_name, vaccine_type,
          manufacturer, batch_number, vaccination_date, next_due_date,
          site_of_injection, adverse_reactions, cost, notes, certificate_issued, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, now()::date, $8, $9, $10, $11, $12, false, $13)
        RETURNING id, vaccine_name, vaccination_date`,
        [
          pet_id,
          appointment_id,
          finalVeterinarianId,
          vaccine.vaccine_name,
          vaccine.vaccine_type || null,
          vaccine.manufacturer || null,
          vaccine.batch_number || null,
          vaccine.next_due_date || null,
          vaccine.site_of_injection || null,
          vaccine.adverse_reactions || null,
          vaccine.cost || 0,
          vaccine.notes || null,
          req.user?.id || null
        ]
      );

      createdVaccinations.push(result.rows[0]);
    }

    res.status(201).json(successResponse({
      count: createdVaccinations.length,
      vaccinations: createdVaccinations
    }, `${createdVaccinations.length} vaccination(s) created`, 201));

  } catch (err) {
    console.error('Create vaccinations error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create vaccination records' });
  }
};

/*
const updateVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const { adverse_reactions, notes, certificate_issued, certificate_number, next_due_date } = req.body;

    let setFields = [];
    const params = [id];
    let paramIndex = 2;

    if (adverse_reactions !== undefined) {
      setFields.push(`adverse_reactions = $${paramIndex}`);
      params.push(adverse_reactions);
      paramIndex++;
    }
    if (notes !== undefined) {
      setFields.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }
    if (certificate_issued !== undefined) {
      setFields.push(`certificate_issued = $${paramIndex}`);
      params.push(certificate_issued);
      paramIndex++;
    }
    if (certificate_number !== undefined) {
      setFields.push(`certificate_number = $${paramIndex}`);
      params.push(certificate_number);
      paramIndex++;
    }
    if (next_due_date !== undefined) {
      setFields.push(`next_due_date = $${paramIndex}`);
      params.push(next_due_date);
      paramIndex++;
    }

    if (setFields.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    setFields.push(`updated_by = $${paramIndex}`);
    params.push(req.user?.id || null);

    const result = await query(
      `UPDATE vet_vaccinations
       SET ${setFields.join(', ')}
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Vaccination record not found' });
    }

    res.json(successResponse(result.rows[0], 'Vaccination updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update vaccination' });
  }
};
*/

// Add vaccinations to existing medical record
const updateVaccinations = async (req, res) => {
  try {
    const { medical_record_id } = req.params;
    const { pet_id, appointment_id, veterinarian_id, vaccinations = [] } = req.body;

    // Validate presence and format of medical_record_id to avoid DB errors
    if (!medical_record_id) {
      return res.status(400).json({ status: 'error', message: 'Missing required parameter: medical_record_id' });
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(medical_record_id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid medical_record_id' });
    }

    // Verify medical record exists
    const recordCheck = await query(
      `SELECT id, pet_id, appointment_id FROM vet_medical_records WHERE id = $1 AND deleted_at IS NULL`,
      [medical_record_id]
    );

    if (recordCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Medical record not found' });
    }

    // Use provided IDs or fallback to medical record's IDs
    const finalPetId = pet_id || recordCheck.rows[0].pet_id;
    const finalAppointmentId = appointment_id || recordCheck.rows[0].appointment_id;

    // Determine and validate veterinarian_id
    let finalVetId = veterinarian_id;

    if (finalVetId) {
      const vetCheck = await query(
        'SELECT id FROM veterinarians WHERE id = $1 AND deleted_at IS NULL',
        [finalVetId]
      );
      if (vetCheck.rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid veterinarian_id' });
      }
    } else {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }
      const vetRes = await query(
        'SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL',
        [userId]
      );
      if (vetRes.rows.length === 0) {
        return res.status(403).json({ status: 'error', message: 'User is not a registered veterinarian' });
      }
      finalVetId = vetRes.rows[0].id;
    }

    if (!Array.isArray(vaccinations) || vaccinations.length === 0) {
      return res.status(400).json({ status: 'error', message: 'vaccinations must be a non-empty array' });
    }

    // Validate each vaccination has vaccine_name
    const invalidVaccines = vaccinations.filter(vaccine => !vaccine.vaccine_name);
    if (invalidVaccines.length > 0) {
      return res.status(400).json({ status: 'error', message: 'All vaccinations must have vaccine_name' });
    }

    // Batch insert all vaccinations
    const createdVaccinations = [];
    for (const vaccine of vaccinations) {
      const result = await query(
        `INSERT INTO vet_vaccinations (
          pet_id, appointment_id, veterinarian_id, vaccine_name, vaccine_type,
          manufacturer, batch_number, vaccination_date, next_due_date,
          site_of_injection, adverse_reactions, cost, notes, certificate_issued, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, now()::date, $8, $9, $10, $11, $12, false, $13)
        RETURNING id, vaccine_name, vaccination_date`,
        [
          finalPetId,
          finalAppointmentId,
          finalVetId,
          vaccine.vaccine_name,
          vaccine.vaccine_type || null,
          vaccine.manufacturer || null,
          vaccine.batch_number || null,
          vaccine.next_due_date || null,
          vaccine.site_of_injection || null,
          vaccine.adverse_reactions || null,
          vaccine.cost || 0,
          vaccine.notes || null,
          req.user?.id || null
        ]
      );
      createdVaccinations.push(result.rows[0]);
    }

    // Fetch all vaccinations for this medical record
    const allVaccines = await query(
      `SELECT id, vaccine_name, vaccination_date FROM vet_vaccinations 
       WHERE pet_id = $1 AND appointment_id = $2 AND deleted_at IS NULL 
       ORDER BY vaccination_date DESC`,
      [finalPetId, finalAppointmentId]
    );

    res.json(successResponse({
      medical_record_id,
      added_count: createdVaccinations.length,
      added_vaccinations: createdVaccinations,
      total_vaccinations: allVaccines.rows.length
    }, `${createdVaccinations.length} vaccination(s) added`));

  } catch (err) {
    console.error('Update vaccinations error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update vaccinations' });
  }
};

const deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE vet_vaccinations SET deleted_at = now(), updated_by = $2 WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id, req.user?.id || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Vaccination record not found' });
    }

    res.json(successResponse(null, 'Vaccination deleted'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete vaccination' });
  }
};

module.exports= {
  listVaccinations,
  getVaccinationById,
  getVaccinationsByMedicalRecordId,
  createVaccination,
  // updateVaccination,
  updateVaccinations,
  deleteVaccination,
}