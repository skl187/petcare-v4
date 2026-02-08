// src/modules/medical-records/lab-tests.controller.js
// ============================================================================
// Lab Tests Controller
// ============================================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

const listLabTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, pet_id, status, test_type, medical_record_id } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE vlt.deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (pet_id) {
      where += ` AND vlt.pet_id = $${paramIndex}`;
      params.push(pet_id);
      paramIndex++;
    }
    if (status) {
      where += ` AND vlt.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (test_type) {
      where += ` AND vlt.test_type = $${paramIndex}`;
      params.push(test_type);
      paramIndex++;
    }
    if (medical_record_id) {
      where += ` AND vlt.medical_record_id = $${paramIndex}`;
      params.push(medical_record_id);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT vlt.id, vlt.test_name, vlt.test_type, vlt.ordered_date, vlt.result_date,
              vlt.status, vlt.urgency, vlt.cost,
              p.name as pet_name, vlt.lab_name
       FROM vet_lab_tests vlt
       LEFT JOIN pets p ON vlt.pet_id = p.id
       ${where}
       ORDER BY vlt.ordered_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_lab_tests vlt ${where}`,
      params.slice(0, -2)
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch lab tests' });
  }
};

// List pending lab tests (not completed/cancelled). Accept optional veterinarian_id filter (joins medical records or appointments).
const listPendingLabTests = async (req, res) => {
  try {
    const { page = 1, limit = 20, veterinarian_id } = req.query;
    const offset = (page - 1) * limit;

    let where = `WHERE vlt.deleted_at IS NULL AND vlt.status IN ('ordered','sample_collected','processing')`;
    const params = [];
    let paramIndex = 1;

    if (veterinarian_id) {
      where += ` AND (mr.veterinarian_id = $${paramIndex} OR a.veterinarian_id = $${paramIndex})`;
      params.push(veterinarian_id);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT vlt.id, vlt.test_name, vlt.test_type, vlt.ordered_date, vlt.result_date,
              vlt.status, vlt.urgency, vlt.cost,
              COALESCE(mr.veterinarian_id, a.veterinarian_id) as veterinarian_id,
              p.name as pet_name
       FROM vet_lab_tests vlt
       LEFT JOIN vet_medical_records mr ON vlt.medical_record_id = mr.id
       LEFT JOIN vet_appointments a ON vlt.appointment_id = a.id
       LEFT JOIN pets p ON vlt.pet_id = p.id
       ${where}
       ORDER BY vlt.ordered_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_lab_tests vlt LEFT JOIN vet_medical_records mr ON vlt.medical_record_id = mr.id LEFT JOIN vet_appointments a ON vlt.appointment_id = a.id ${where}`,
      params.slice(0, -2)
    );

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].total) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch pending lab tests' });
  }
};

// Vet-specific pending lab tests (for authenticated veterinarian)
const listPendingLabTestsForVet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const vetRes = await query('SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    if (vetRes.rows.length === 0) return res.status(403).json({ status: 'error', message: 'Not a veterinarian' });
    const veterinarian_id = vetRes.rows[0].id;

    // delegate to listPendingLabTests with veterinarian_id param
    req.query.veterinarian_id = veterinarian_id;
    return listPendingLabTests(req, res);
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch vet pending lab tests' });
  }
};

const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT vlt.*, p.name as pet_name
       FROM vet_lab_tests vlt
       LEFT JOIN pets p ON vlt.pet_id = p.id
       WHERE vlt.id = $1 AND vlt.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Lab test not found' });
    }

    res.json(successResponse(result.rows[0]));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch lab test' });
  }
};

// Get all lab tests for a medical record
const getLabTestsByMedicalRecordId = async (req, res) => {
  try {
    const { medical_record_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Verify medical record exists
    const recordCheck = await query(
      `SELECT id FROM vet_medical_records WHERE id = $1 AND deleted_at IS NULL`,
      [medical_record_id]
    );

    if (recordCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Medical record not found' });
    }

    // Fetch lab tests for this medical record
    const result = await query(
      `SELECT vlt.id, vlt.test_name, vlt.test_type, vlt.ordered_date, vlt.result_date,
              vlt.status, vlt.urgency, vlt.cost, vlt.results, vlt.normal_range, 
              vlt.interpretation, vlt.lab_name,
              p.name as pet_name
       FROM vet_lab_tests vlt
       LEFT JOIN pets p ON vlt.pet_id = p.id
       WHERE vlt.medical_record_id = $1 AND vlt.deleted_at IS NULL
       ORDER BY vlt.ordered_date DESC
       LIMIT $2 OFFSET $3`,
      [medical_record_id, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_lab_tests WHERE medical_record_id = $1 AND deleted_at IS NULL`,
      [medical_record_id]
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    console.error('Get lab tests error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch lab tests' });
  }
};

const createLabTest = async (req, res) => {
  try {
    const {
      medical_record_id,
      appointment_id,
      pet_id,
      lab_tests = []
    } = req.body;

    // Validation
    if (!medical_record_id || !appointment_id || !pet_id) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields: medical_record_id, appointment_id, pet_id' });
    }

    if (!Array.isArray(lab_tests) || lab_tests.length === 0) {
      return res.status(400).json({ status: 'error', message: 'lab_tests must be a non-empty array' });
    }

    // Validate each test has test_name
    const invalidTests = lab_tests.filter(test => !test.test_name);
    if (invalidTests.length > 0) {
      return res.status(400).json({ status: 'error', message: 'All tests must have test_name' });
    }

    // Batch insert all tests
    const createdTests = [];
    
    for (const test of lab_tests) {
      const result = await query(
        `INSERT INTO vet_lab_tests (
          medical_record_id, appointment_id, pet_id, test_name, test_type,
          ordered_date, sample_collected_date, status, normal_range, lab_name, urgency, cost, created_by
        )
        VALUES ($1, $2, $3, $4, $5, now()::date, $6, 'ordered', $7, $8, $9, $10, $11)
        RETURNING id, test_name, status, ordered_date`,
        [
          medical_record_id,
          appointment_id,
          pet_id,
          test.test_name,
          test.test_type || null,
          test.sample_collected_date || null,
          test.normal_range || null,
          test.lab_name || null,
          test.urgency || 'routine',
          test.cost || 0,
          req.user?.id || null
        ]
      );

      createdTests.push(result.rows[0]);
    }

    res.status(201).json(successResponse({
      count: createdTests.length,
      tests: createdTests
    }, `${createdTests.length} lab test(s) created`, 201));

  } catch (err) {
    console.error('Create lab tests error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create lab tests' });
  }
};


const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, results, interpretation, result_date } = req.body;

    const validStatuses = ['ordered', 'sample_collected', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    let setFields = ['status = $2', 'updated_by = $3'];
    const params = [id, status, req.user?.id || null];
    let paramIndex = 4;

    if (status === 'sample_collected') {
      setFields.push(`sample_collected_date = now()`);
    } else if (status === 'completed' || status === 'processing') {
      if (results) {
        setFields.push(`results = $${paramIndex}`);
        params.push(results);
        paramIndex++;
      }
      if (interpretation) {
        setFields.push(`interpretation = $${paramIndex}`);
        params.push(interpretation);
        paramIndex++;
      }
      if (result_date) {
        setFields.push(`result_date = $${paramIndex}`);
        params.push(result_date);
        paramIndex++;
      } else if (status === 'completed') {
        setFields.push(`result_date = now()`);
      }
    }

    const result = await query(
      `UPDATE vet_lab_tests
       SET ${setFields.join(', ')}
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, status, result_date`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Lab test not found' });
    }

    res.json(successResponse(result.rows[0], 'Lab test updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update lab test' });
  }
};

// Update lab test details (test_type, normal_range, lab_name, urgency, cost)
const updateLabTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { test_type, normal_range, lab_name, urgency, cost } = req.body;

    let setFields = [];
    const params = [id];
    let paramIndex = 2;

    if (test_type !== undefined) {
      setFields.push(`test_type = $${paramIndex}`);
      params.push(test_type);
      paramIndex++;
    }
    if (normal_range !== undefined) {
      setFields.push(`normal_range = $${paramIndex}`);
      params.push(normal_range);
      paramIndex++;
    }
    if (lab_name !== undefined) {
      setFields.push(`lab_name = $${paramIndex}`);
      params.push(lab_name);
      paramIndex++;
    }
    if (urgency !== undefined) {
      const validUrgencies = ['routine', 'urgent', 'stat'];
      if (!validUrgencies.includes(urgency)) {
        return res.status(400).json({ status: 'error', message: 'Invalid urgency. Must be routine, urgent, or stat' });
      }
      setFields.push(`urgency = $${paramIndex}`);
      params.push(urgency);
      paramIndex++;
    }
    if (cost !== undefined) {
      setFields.push(`cost = $${paramIndex}`);
      params.push(cost);
      paramIndex++;
    }

    if (setFields.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    setFields.push(`updated_by = $${paramIndex}`);
    params.push(req.user?.id || null);

    const result = await query(
      `UPDATE vet_lab_tests
       SET ${setFields.join(', ')}
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, test_name, test_type, normal_range, lab_name, urgency, cost`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Lab test not found' });
    }

    res.json(successResponse(result.rows[0], 'Lab test details updated'));
  } catch (err) {
    console.error('Update lab test error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update lab test' });
  }
};

// Delete lab test (soft delete)
const deleteLabTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE vet_lab_tests SET deleted_at = now(), updated_by = $2 WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id, req.user?.id || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Lab test not found' });
    }

    res.json(successResponse(null, 'Lab test deleted'));
  } catch (err) {
    console.error('Delete lab test error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete lab test' });
  }
};

module.exports = {
  listLabTests,
  getLabTestById,
  getLabTestsByMedicalRecordId,
  createLabTest,
  updateLabTestStatus,
  updateLabTestById,
  deleteLabTestById,
  listPendingLabTests,
  listPendingLabTestsForVet
};