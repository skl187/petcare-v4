// src/modules/appointments/appointments.routes.js
// ============================================================================
// Veterinary Appointments Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const appointmentsController = require('./appointments.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');
const { createMedicalRecord} = require('../medical-records/medical-records.controller');
const { createPrescription } = require('../medical-records/prescriptions.controller');

// ============================================================================
// APPOINTMENT LISTING & RETRIEVAL (Authenticated)
// ============================================================================

// GET /api/appointments ADMINISTRATOR ONLY
router.get('/', requireAuth, appointmentsController.listAppointments);

// GET /api/appointments/vet/list?filter=today | filter=upcoming | filter=past | filter=all OWNER ROUTE
router.get('/vet/list', requireAuth, appointmentsController.getVetAppointmentsByFilter);

// GET /api/appointments/owner/list?filter=today|upcoming|past|all&page=1&limit=20&status=* VET ROUTE
router.get('/owner/list', requireAuth, appointmentsController.getOwnerAppointmentsByFilter);

router.get('/:id', requireAuth, appointmentsController.getAppointmentById);

// GET /api/appointments/pet/:pet_id/profile - Get complete pet profile with all appointments
router.get('/pet/:pet_id/profile', requireAuth, appointmentsController.getPetWithAppointments);

router.get('/pet/:pet_id', requireAuth, appointmentsController.getPetAppointments);

// router.get('/:appointmentId/medical-data', requireAuth, appointmentsController.getAppointmentMedicalData);

router.post('/', requireAuth, appointmentsController.createAppointment);

// ============================================================================
// APPOINTMENT STATUS MANAGEMENT
// ============================================================================

// PATCH /api/appointments/:id/status
// Update appointment status: scheduled -> confirmed -> in_progress -> completed
// OR scheduled/confirmed -> cancelled (with reason in notes)
// Request body: { status: "scheduled|confirmed|in_progress|completed|cancelled|no_show|rescheduled", notes: "reason" }
router.patch(
  '/:id/status',
  requireAuth,
  appointmentsController.updateAppointmentStatus
);

// ============================================================================
// APPOINTMENT RESCHEDULING
// ============================================================================

// POST /api/appointments/:id/reschedule
// Reschedule an appointment to a new date and time
// Request body: { new_date: "YYYY-MM-DD", new_time: "HH:MM", reason: "reason for rescheduling" }
router.post(
  '/:id/reschedule',
  requireAuth,
  appointmentsController.rescheduleAppointment
);

// ============================================================================
// PAYMENT MANAGEMENT
// ============================================================================

// POST /api/appointments/:appointmentId/payment
// Process payment for an appointment
// Request body: { payment_type: "online|cash|insurance", method: "...", amount: 0, status: "completed|pending|failed" }
router.post(
  '/:appointmentId/payment',
  requireAuth,
  appointmentsController.processPayment
);

// GET /api/appointments/:appointmentId/payment
// Retrieve payment information and transaction history for an appointment
router.get(
  '/:appointmentId/payment',
  requireAuth,
  appointmentsController.getPaymentInfo
);

/**
 * POST /medical-records
 * Create medical record (by veterinarian after appointment)
 * Body: {
 *   appointment_id, pet_id, veterinarian_id, record_type,
 *   diagnosis?, symptoms_observed?, vital_signs?, physical_examination?,
 *   treatment_plan?, recommendations?, followup_required?, followup_date?, notes?, is_confidential?
 * }
 */
router.post(
  '/vet/:appointmentId/medical-record',
  requireAuth,
  createMedicalRecord
);

/**
 * POST /medical-records/prescriptions
 * Create prescription with medications
 * Body: {
 *   medical_record_id, appointment_id, pet_id, veterinarian_id,
 *   valid_until?, notes?,
 *   medications: [
 *     { medication_name, dosage, frequency, duration, route?, instructions?, quantity?, refills_allowed? }
 *   ]
 * }
 */
router.post(
  '/vet/:appointmentId/prescriptions', 
  requireAuth, 
  createPrescription
);

module.exports = router;