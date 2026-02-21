// src/modules/payments/payments.controller.js
// ============================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

/**
 * GET /api/payments/vet?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
 * Returns all payment records for veterinarians filtered by optional date range.
 * "vet" is determined from req.user.id -> veterinarians.user_id
 */
const listVetPayments = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    // find veterinarian id
    const vetRes = await query(
      `SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    if (vetRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Veterinarian record not found' });
    }
    const vetId = vetRes.rows[0].id;

    // date filtering
    const { from_date, to_date } = req.query;
    const params = [vetId];
    let where = `WHERE a.veterinarian_id = $1`;
    let idx = 2;

    if (from_date) {
      where += ` AND p.payment_date >= $${idx}`;
      params.push(from_date);
      idx++;
    }
    if (to_date) {
      where += ` AND p.payment_date <= $${idx}`;
      params.push(to_date);
      idx++;
    }

    const sql = `
      SELECT p.*, a.clinic_id, a.appointment_date, a.status as appointment_status
      FROM vet_appointment_payments p
      JOIN vet_appointments a ON p.appointment_id = a.id
      ${where}
      ORDER BY p.payment_date DESC
    `;

    const result = await query(sql, params);
    res.json(successResponse(result.rows));
  } catch (err) {
    console.error('List vet payments failed', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payments' });
  }
};

/**
 * GET /api/payments/all  (admin only)
 * Returns all payment records across all vets with owner, pet, vet, clinic info.
 */
const listAllPayments = async (req, res) => {
  try {
    const { from_date, to_date, status } = req.query;
    const params = [];
    let where = `WHERE 1=1`;
    let idx = 1;

    if (from_date) {
      where += ` AND p.payment_date >= $${idx}`;
      params.push(from_date);
      idx++;
    }
    if (to_date) {
      where += ` AND p.payment_date <= $${idx}`;
      params.push(to_date);
      idx++;
    }
    if (status) {
      where += ` AND p.payment_status = $${idx}`;
      params.push(status);
      idx++;
    }

    const sql = `
      SELECT
        p.*,
        a.appointment_date, a.appointment_time, a.status AS appointment_status, a.pet_id,
        a.clinic_id,
        u.first_name  AS owner_first_name, u.last_name  AS owner_last_name, u.email AS owner_email,
        pt.name       AS pet_name,
        vu.first_name AS vet_first_name,  vu.last_name  AS vet_last_name,
        c.name        AS clinic_name
      FROM vet_appointment_payments p
      JOIN vet_appointments a  ON p.appointment_id = a.id
      LEFT JOIN users u        ON a.user_id = u.id
      LEFT JOIN pets pt        ON a.pet_id  = pt.id
      LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
      LEFT JOIN users vu       ON v.user_id = vu.id
      LEFT JOIN vet_clinics c  ON a.clinic_id = c.id
      ${where}
      ORDER BY p.payment_date DESC NULLS LAST, p.created_at DESC
    `;

    const result = await query(sql, params);
    res.json(successResponse(result.rows));
  } catch (err) {
    console.error('List all payments failed', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payments' });
  }
};

/**
 * GET /api/payments/user  (owner only)
 * Returns payment records for the authenticated user.
 */
const listUserPayments = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const { from_date, to_date } = req.query;
    const params = [userId];
    let where = `WHERE a.user_id = $1`;
    let idx = 2;

    if (from_date) {
      where += ` AND p.payment_date >= $${idx}`;
      params.push(from_date);
      idx++;
    }
    if (to_date) {
      where += ` AND p.payment_date <= $${idx}`;
      params.push(to_date);
      idx++;
    }

    const sql = `
      SELECT
        p.*,
        a.appointment_date, a.appointment_time, a.status AS appointment_status,
        pt.name       AS pet_name,
        vu.first_name AS vet_first_name, vu.last_name AS vet_last_name,
        c.name        AS clinic_name
      FROM vet_appointment_payments p
      JOIN vet_appointments a  ON p.appointment_id = a.id
      LEFT JOIN pets pt        ON a.pet_id  = pt.id
      LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
      LEFT JOIN users vu       ON v.user_id = vu.id
      LEFT JOIN vet_clinics c  ON a.clinic_id = c.id
      ${where}
      ORDER BY p.payment_date DESC NULLS LAST, p.created_at DESC
    `;

    const result = await query(sql, params);
    res.json(successResponse(result.rows));
  } catch (err) {
    console.error('List user payments failed', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payments' });
  }
};

/**
 * PATCH /api/payments/:id
 * Update payment status.
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const allowed = ['pending', 'completed', 'failed', 'cancelled'];
    if (!allowed.includes(payment_status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid payment_status' });
    }
    const result = await query(
      `UPDATE vet_appointment_payments SET payment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [payment_status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Payment not found' });
    }
    res.json(successResponse(result.rows[0]));
  } catch (err) {
    console.error('Update payment status failed', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update payment' });
  }
};

module.exports = { listVetPayments, listAllPayments, listUserPayments, updatePaymentStatus };
