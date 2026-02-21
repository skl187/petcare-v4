/**
 * Split Payment Service Controller
 * Handles recording, updating, and managing split/partial payments
 */

const db = require('../../../config/database');
const paymentUtils = require('../../core/utils/paymentUtils');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../core/utils/logger');

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
    // Validate appointment exists and get details
    const appointmentResult = await db.query(
      `SELECT id, total_amount, user_id 
       FROM vet_appointments 
       WHERE id = $1`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointmentResult.rows[0];

    // Get existing payments for this appointment
    const existingPaymentsResult = await db.query(
      `SELECT id, paid_amount, is_partial, payment_status, split_payment_group_id 
       FROM vet_appointment_payments 
       WHERE appointment_id = $1 
       ORDER BY payment_sequence ASC`,
      [appointmentId]
    );

    const existingPayments = existingPaymentsResult.rows;

    // Validate split payment
    const validationResult = paymentUtils.validateSplitPayment({
      appointmentTotal: parseFloat(appointment.total_amount),
      paymentAmount: parseFloat(paid_amount),
      existingPayments,
      paymentMethod: payment_method,
      splitPaymentGroupId: split_payment_group_id
    });

    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    // Determine if this is actually a split payment
    const isSplit = is_partial || existingPayments.length > 0;
    const groupId = isSplit ? (split_payment_group_id || uuidv4()) : null;
    const sequence = isSplit ? paymentUtils.getNextPaymentSequence(existingPayments, groupId) : null;

    // Insert new payment record
    const paymentId = uuidv4();
    const newPaymentResult = await db.query(
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

    // Update appointment payment status
    const totalPaid = paymentUtils.calculateTotalPaid([...existingPayments, newPayment]);
    const appointmentTotal = parseFloat(appointment.total_amount);
    const newPaymentStatus = totalPaid >= appointmentTotal ? 'paid' : 'partially_paid';

    await db.query(
      `UPDATE vet_appointments 
       SET payment_status = $1, updated_at = NOW() 
       WHERE id = $2`,
      [newPaymentStatus, appointmentId]
    );

    // Log transaction if provider-based payment
    if (req.body.provider_code && req.body.transaction_id) {
      await db.query(
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

    res.status(201).json({
      success: true,
      payment: newPayment,
      appointmentStatus: {
        totalPaid,
        remainingBalance: appointmentTotal - totalPaid,
        paymentStatus: newPaymentStatus
      }
    });
  } catch (error) {
    logger.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

/**
 * Get all payments for an appointment
 * GET /api/vet-appointments/:appointmentId/payments
 */
const getAppointmentPayments = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const result = await db.query(
      `SELECT ap.*, apt.total_amount
       FROM vet_appointment_payments ap
       JOIN vet_appointments apt ON ap.appointment_id = apt.id
       WHERE ap.appointment_id = $1
       ORDER BY ap.payment_sequence ASC, ap.created_at ASC`,
      [appointmentId]
    );

    const payments = result.rows;

    // Calculate summary
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

    res.json({
      success: true,
      data: payments,
      summary
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
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
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    // Update payment
    const result = await db.query(
      `UPDATE vet_appointment_payments 
       SET payment_status = $1, updated_at = NOW() 
       WHERE id = $2 AND appointment_id = $3
       RETURNING *`,
      [payment_status, paymentId, appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updatedPayment = result.rows[0];

    // Recalculate appointment payment status
    const paymentsResult = await db.query(
      `SELECT * FROM vet_appointment_payments WHERE appointment_id = $1`,
      [appointmentId]
    );

    const allPayments = paymentsResult.rows;
    const totalPaid = paymentUtils.calculateTotalPaid(allPayments);

    const appointmentResult = await db.query(
      `SELECT total_amount FROM vet_appointments WHERE id = $1`,
      [appointmentId]
    );

    const appointmentTotal = parseFloat(appointmentResult.rows[0].total_amount);
    const newAppointmentStatus = totalPaid >= appointmentTotal ? 'paid' : 'partially_paid';

    await db.query(
      `UPDATE vet_appointments 
       SET payment_status = $1, updated_at = NOW() 
       WHERE id = $2`,
      [newAppointmentStatus, appointmentId]
    );

    logger.info(`Payment ${paymentId} status updated to ${payment_status}`);

    res.json({
      success: true,
      payment: updatedPayment,
      appointmentPaymentStatus: newAppointmentStatus
    });
  } catch (error) {
    logger.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

/**
 * Delete a split payment (only if not fully paid)
 * DELETE /api/vet-appointments/:appointmentId/payments/:paymentId
 */
const deletePayment = async (req, res) => {
  const { appointmentId, paymentId } = req.params;

  try {
    // Get payment to delete
    const paymentResult = await db.query(
      `SELECT * FROM vet_appointment_payments WHERE id = $1 AND appointment_id = $2`,
      [paymentId, appointmentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if appointment is already paid beyond this payment
    const allPaymentsResult = await db.query(
      `SELECT * FROM vet_appointment_payments WHERE appointment_id = $1`,
      [appointmentId]
    );

    const allPayments = allPaymentsResult.rows.filter(p => p.id !== paymentId);
    const appointmentResult = await db.query(
      `SELECT total_amount FROM vet_appointments WHERE id = $1`,
      [appointmentId]
    );

    const appointmentTotal = parseFloat(appointmentResult.rows[0].total_amount);
    const totalPaidAfterDelete = paymentUtils.calculateTotalPaid(allPayments);

    // Only allow deletion if payment hasn't been processed
    if (paymentResult.rows[0].payment_status === 'paid' && totalPaidAfterDelete >= appointmentTotal) {
      return res.status(400).json({ 
        error: 'Cannot delete payment - appointment would become unpaid' 
      });
    }

    // Delete payment transactions first
    await db.query(
      `DELETE FROM vet_payment_transactions WHERE payment_id = $1`,
      [paymentId]
    );

    // Delete payment
    await db.query(
      `DELETE FROM vet_appointment_payments WHERE id = $1`,
      [paymentId]
    );

    // Update appointment status
    const newAppointmentStatus = totalPaidAfterDelete >= appointmentTotal ? 'paid' : 'partially_paid';
    await db.query(
      `UPDATE vet_appointments 
       SET payment_status = $1, updated_at = NOW() 
       WHERE id = $2`,
      [newAppointmentStatus, appointmentId]
    );

    logger.info(`Payment ${paymentId} deleted from appointment ${appointmentId}`);

    res.json({
      success: true,
      message: 'Payment deleted successfully',
      appointmentPaymentStatus: newAppointmentStatus
    });
  } catch (error) {
    logger.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

/**
 * Get split payment summary for an appointment
 * GET /api/vet-appointments/:appointmentId/payment-summary
 */
const getPaymentSummary = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const paymentsResult = await db.query(
      `SELECT ap.*, apt.total_amount
       FROM vet_appointment_payments ap
       JOIN vet_appointments apt ON ap.appointment_id = apt.id
       WHERE ap.appointment_id = $1
       ORDER BY ap.payment_sequence ASC`,
      [appointmentId]
    );

    const payments = paymentsResult.rows;

    if (payments.length === 0) {
      return res.status(404).json({ error: 'No payments found for appointment' });
    }

    const appointmentTotal = parseFloat(payments[0].total_amount);
    const summary = paymentUtils.getPaymentSummary(appointmentTotal, payments);

    res.json({
      success: true,
      data: summary,
      payments: payments.map(p => ({
        id: p.id,
        method: p.payment_method,
        amount: parseFloat(p.paid_amount),
        status: p.payment_status,
        sequence: p.payment_sequence,
        date: p.payment_date
      }))
    });
  } catch (error) {
    logger.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
};

module.exports = {
  recordPayment,
  getAppointmentPayments,
  updatePaymentStatus,
  deletePayment,
  getPaymentSummary
};
