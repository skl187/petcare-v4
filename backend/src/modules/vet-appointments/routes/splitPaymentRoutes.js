/**
 * Split Payment Routes
 * Routes for handling split and partial payment operations
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const splitPaymentController = require('../controllers/splitPaymentController');
const { authMiddleware } = require('../../../core/auth');
const { validatePaymentInput } = require('../middlewares/paymentValidation');

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/vet-appointments/:appointmentId/payments
 * Record a new payment (supports split payments)
 */
router.post('/', validatePaymentInput, splitPaymentController.recordPayment);

/**
 * GET /api/vet-appointments/:appointmentId/payments
 * Get all payments for an appointment
 */
router.get('/', splitPaymentController.getAppointmentPayments);

/**
 * PUT /api/vet-appointments/:appointmentId/payments/:paymentId
 * Update payment status
 */
router.put('/:paymentId', splitPaymentController.updatePaymentStatus);

/**
 * DELETE /api/vet-appointments/:appointmentId/payments/:paymentId
 * Delete a payment (only if not fully paid)
 */
router.delete('/:paymentId', splitPaymentController.deletePayment);

/**
 * GET /api/vet-appointments/:appointmentId/payment-summary
 * Get split payment summary for an appointment
 */
router.get('/summary/:summary', splitPaymentController.getPaymentSummary);

module.exports = router;
