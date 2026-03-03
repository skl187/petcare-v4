/**
 * Split Payment Service Controller
 * Handles recording, updating, and managing split/partial payments
 */

const { query } = require('../../../core/db/pool');
const paymentUtils = require('../../../core/utils/paymentUtils');
const { successResponse } = require('../../../core/utils/response');
const logger = require('../../../core/utils/logger');
const { randomUUID } = require('crypto'); // use built-in crypto instead of uuid package (ESM only)


/**
 * Record a payment for an appointment (supports split payments)
 * POST /api/vet-appointments/:appointmentId/payments
 */
const recordPayment = async (req, res) => {
  const { appointmentId } = req.params;
  const {
    payment_method,
    paid_amount,
    is_partial,
    split_payment_group_id,
    notes
  } = req.body;

  try {
    const appointmentResult = await query(
      `SELECT id, total_amount, user_id
       FROM vet_appointments
       WHERE id = $1`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found', timestamp: new Date().toISOString() });
    }

    const appointment = appointmentResult.rows[0];

    const existingPaymentsResult = await query(
      `SELECT id, paid_amount, is_partial, payment_status, split_payment_group_id
       FROM vet_appointment_payments
       WHERE appointment_id = $1
       ORDER BY payment_sequence ASC`,
      [appointmentId]
    );

    const existingPayments = existingPaymentsResult.rows;

    const validationResult = paymentUtils.validateSplitPayment({
      appointmentTotal: parseFloat(appointment.total_amount),
      paymentAmount: parseFloat(paid_amount),
      existingPayments,
      paymentMethod: payment_method,
      splitPaymentGroupId: split_payment_group_id
    });

    if (!validationResult.isValid) {
      return res.status(400).json({ status: 'error', message: validationResult.error, timestamp: new Date().toISOString() });
    }

    const isSplit = is_partial || existingPayments.length > 0;
    const groupId = isSplit ? (split_payment_group_id || randomUUID()) : null;
    const sequence = isSplit ? paymentUtils.getNextPaymentSequence(existingPayments, groupId) : null;

    const paymentId = randomUUID();
    const newPaymentResult = await query(
      `INSERT INTO vet_appointment_payments (
        id, appointment_id, user_id, payment_method, paid_amount,
        total_amount, payment_status, is_partial, split_payment_group_id,
        payment_sequence, payment_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
      RETURNING *`,
      [
        paymentId,
        appointmentId,
        appointment.user_id,
        payment_method,
        paid_amount,
        appointment.total_amount,
        'paid',
        isSplit ? true : false,
        groupId,
        sequence,
        notes
      ]
    );

    const newPayment = newPaymentResult.rows[0];

    const totalPaid = paymentUtils.calculateTotalPaid([...existingPayments, newPayment]);
    const appointmentTotal = parseFloat(appointment.total_amount);
    const newPaymentStatus = totalPaid >= appointmentTotal ? 'paid' : 'partially_paid';

    await query(
      `UPDATE vet_appointments
       SET payment_status = $1, updated_at = NOW()
       WHERE id = $2`,
      [newPaymentStatus, appointmentId]
    );

    if (req.body.provider_code && req.body.transaction_id) {
      await query(
        `INSERT INTO vet_payment_transactions (
          payment_id, provider_code, transaction_id, provider_response, status, transaction_date
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          paymentId,
          req.body.provider_code,
          req.body.transaction_id,
          JSON.stringify(req.body.provider_response || {}),
          'completed'
        ]
      );
    }

    logger.info(`Payment recorded: ${paymentId} for appointment ${appointmentId}`);

    res.status(201).json(successResponse({
      payment: newPayment,
      appointmentStatus: {
        totalPaid,
        remainingBalance: appointmentTotal - totalPaid,
        paymentStatus: newPaymentStatus
      }
    }, 'Payment recorded successfully'));
  } catch (error) {
    logger.error('Error recording payment', error);
    res.status(500).json({ status: 'error', message: 'Failed to record payment', timestamp: new Date().toISOString() });
  }
};

/**
 * Get all payments for an appointment
 * GET /api/vet-appointments/:appointmentId/payments
 */
const getAppointmentPayments = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const result = await query(
      `SELECT ap.*, apt.total_amount
       FROM vet_appointment_payments ap
       JOIN vet_appointments apt ON ap.appointment_id = apt.id
       WHERE ap.appointment_id = $1
       ORDER BY ap.payment_sequence ASC, ap.created_at ASC`,
      [appointmentId]
    );

    const payments = result.rows;

    const appointmentTotal = payments.length > 0 ? parseFloat(payments[0].total_amount) : 0;
    const totalPaid = paymentUtils.calculateTotalPaid(payments);
    const summary = {
      total_amount: appointmentTotal,
      total_paid: totalPaid,
      remaining_balance: Math.max(0, appointmentTotal - totalPaid),
      payment_count: payments.length,
      is_fully_paid: totalPaid >= appointmentTotal,
      is_split_payment: paymentUtils.hasSplitPayments(payments)
    };

    res.json(successResponse({ payments, summary }, 'Payments fetched'));
  } catch (error) {
    logger.error('Error fetching payments', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payments', timestamp: new Date().toISOString() });
  }
};

/**
 * Update payment status
 * PUT /api/vet-appointments/:appointmentId/payments/:paymentId
 */
const updatePaymentStatus = async (req, res) => {
  const { appointmentId, paymentId } = req.params;
  const { payment_status } = req.body;

  const validStatuses = ['pending', 'paid', 'partially_paid', 'failed', 'cancelled'];

  try {
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid payment status', timestamp: new Date().toISOString() });
    }

    const result = await query(
      `UPDATE vet_appointment_payments
       SET payment_status = $1, updated_at = NOW()
       WHERE id = $2 AND appointment_id = $3
       RETURNING *`,
      [payment_status, paymentId, appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Payment not found', timestamp: new Date().toISOString() });
    }

    const updatedPayment = result.rows[0];

    const paymentsResult = await query(
      `SELECT * FROM vet_appointment_payments WHERE appointment_id = $1`,
      [appointmentId]
    );

    const allPayments = paymentsResult.rows;
    const totalPaid = paymentUtils.calculateTotalPaid(allPayments);

    const appointmentResult = await query(
      `SELECT total_amount FROM vet_appointments WHERE id = $1`,
      [appointmentId]
    );

    const appointmentTotal = parseFloat(appointmentResult.rows[0].total_amount);
    const newAppointmentStatus = totalPaid >= appointmentTotal ? 'paid' : 'partially_paid';

    await query(
      `UPDATE vet_appointments
       SET payment_status = $1, updated_at = NOW()
       WHERE id = $2`,
      [newAppointmentStatus, appointmentId]
    );

    logger.info(`Payment ${paymentId} status updated to ${payment_status}`);

    res.json(successResponse({
      payment: updatedPayment,
      appointmentPaymentStatus: newAppointmentStatus
    }, 'Payment status updated'));
  } catch (error) {
    logger.error('Error updating payment', error);
    res.status(500).json({ status: 'error', message: 'Failed to update payment', timestamp: new Date().toISOString() });
  }
};

/**
 * Delete a split payment (only if not fully paid)
 * DELETE /api/vet-appointments/:appointmentId/payments/:paymentId
 */
const deletePayment = async (req, res) => {
  const { appointmentId, paymentId } = req.params;

  try {
    const paymentResult = await query(
      `SELECT * FROM vet_appointment_payments WHERE id = $1 AND appointment_id = $2`,
      [paymentId, appointmentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Payment not found', timestamp: new Date().toISOString() });
    }

    const allPaymentsResult = await query(
      `SELECT * FROM vet_appointment_payments WHERE appointment_id = $1`,
      [appointmentId]
    );

    const allPayments = allPaymentsResult.rows.filter(p => p.id !== paymentId);
    const appointmentResult = await query(
      `SELECT total_amount FROM vet_appointments WHERE id = $1`,
      [appointmentId]
    );

    const appointmentTotal = parseFloat(appointmentResult.rows[0].total_amount);
    const totalPaidAfterDelete = paymentUtils.calculateTotalPaid(allPayments);

    if (paymentResult.rows[0].payment_status === 'paid' && totalPaidAfterDelete >= appointmentTotal) {
      return res.status(400).json({
        status: 'error', message: 'Cannot delete payment - appointment would become unpaid', timestamp: new Date().toISOString()
      });
    }

    await query(
      `DELETE FROM vet_payment_transactions WHERE payment_id = $1`,
      [paymentId]
    );

    await query(
      `DELETE FROM vet_appointment_payments WHERE id = $1`,
      [paymentId]
    );

    const newAppointmentStatus = totalPaidAfterDelete >= appointmentTotal ? 'paid' : 'partially_paid';
    await query(
      `UPDATE vet_appointments
       SET payment_status = $1, updated_at = NOW()
       WHERE id = $2`,
      [newAppointmentStatus, appointmentId]
    );

    logger.info(`Payment ${paymentId} deleted from appointment ${appointmentId}`);

    res.json(successResponse({
      appointmentPaymentStatus: newAppointmentStatus
    }, 'Payment deleted successfully'));
  } catch (error) {
    logger.error('Error deleting payment', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete payment', timestamp: new Date().toISOString() });
  }
};

/**
 * Get split payment summary for an appointment
 * GET /api/vet-appointments/:appointmentId/payment-summary
 */
const getPaymentSummary = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const paymentsResult = await query(
      `SELECT ap.*, apt.total_amount
       FROM vet_appointment_payments ap
       JOIN vet_appointments apt ON ap.appointment_id = apt.id
       WHERE ap.appointment_id = $1
       ORDER BY ap.payment_sequence ASC`,
      [appointmentId]
    );

    const payments = paymentsResult.rows;

    if (payments.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No payments found for appointment', timestamp: new Date().toISOString() });
    }

    const appointmentTotal = parseFloat(payments[0].total_amount);
    const summary = paymentUtils.getPaymentSummary(appointmentTotal, payments);

    res.json(successResponse({
      summary,
      payments: payments.map(p => ({
        id: p.id,
        method: p.payment_method,
        amount: parseFloat(p.paid_amount),
        status: p.payment_status,
        sequence: p.payment_sequence,
        date: p.payment_date
      }))
    }, 'Payment summary fetched'));
  } catch (error) {
    logger.error('Error fetching payment summary', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payment summary', timestamp: new Date().toISOString() });
  }
};

module.exports = {
  recordPayment,
  getAppointmentPayments,
  updatePaymentStatus,
  deletePayment,
  getPaymentSummary
};
