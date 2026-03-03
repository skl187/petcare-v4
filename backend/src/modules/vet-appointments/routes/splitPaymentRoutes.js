/**
 * Split Payment Routes
 * Routes for handling split and partial payment operations
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const splitPaymentController = require('../controllers/splitPaymentController');
const { requireAuth } = require('../../../core/auth/auth.middleware');
const { validatePaymentInput } = require('../middlewares/paymentValidation');

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/vet-appointments/:appointmentId/payments
 * Record a new payment (supports split payments)
 */
router.post('/:appointmentId/payments', validatePaymentInput, splitPaymentController.recordPayment);

/**
 * GET /api/vet-appointments/:appointmentId/payments
 * Get all payments for an appointment
 */
router.get('/:appointmentId/payments', splitPaymentController.getAppointmentPayments);

/**
 * PUT /api/vet-appointments/:appointmentId/payments/:paymentId
 * Update payment status
 */
router.put('/:appointmentId/payments/:paymentId', splitPaymentController.updatePaymentStatus);

/**
 * DELETE /api/vet-appointments/:appointmentId/payments/:paymentId
 * Delete a payment (only if not fully paid)
 */
router.delete('/:appointmentId/payments/:paymentId', splitPaymentController.deletePayment);

/**
 * GET /api/vet-appointments/:appointmentId/payment-summary
 * Get split payment summary for an appointment
 */
router.get('/:appointmentId/payment-summary', splitPaymentController.getPaymentSummary);

module.exports = router;
