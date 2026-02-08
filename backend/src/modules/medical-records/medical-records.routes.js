// src/modules/medical-records/medical-records.routes.js
// ============================================================================
// Medical Records, Prescriptions, Lab Tests & Vaccinations Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const medicalController = require('./medical-records.controller.js');
const prescriptionController = require('./prescriptions.controller');
const labController = require('./lab-tests.controller');
const vaccinationController = require('./vaccinations.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

// ============================================================================
// MEDICAL RECORDS ROUTES
// ============================================================================

/**
 * GET /medical-records
 * List medical records with filters
 * Query: page, limit, pet_id, veterinarian_id, record_type, date_from, date_to
 */
router.get('/records', requireAuth, medicalController.listMedicalRecords);

/**
 * GET /medical-records/:id
 * Get specific medical record with related prescriptions and lab tests
 */
router.get('/records/:id', requireAuth, medicalController.getMedicalRecordById);


/**
 * PATCH /medical-records/:id
 * Update medical record
 */
router.patch('/records/:id', requireAuth, medicalController.updateMedicalRecord);

/**
 * DELETE /medical-records/:id
 * Soft delete medical record
 */
router.delete('/records/:id', requireAuth, medicalController.deleteMedicalRecord);

// ============================================================================
// PRESCRIPTIONS ROUTES
// ============================================================================

/**
 * POST /medical-records/prescriptions
 * Create prescription for a medical record
 * Body: {
 *   medical_record_id, appointment_id?, pet_id, veterinarian_id,
 *   medication_name, dosage_instructions?, frequency?, duration_days?,
 *   refill_count?, refill_frequency?, instructions?, cost?
 * }
 */
router.post('/prescriptions', requireAuth, prescriptionController.createPrescription);

/**
 * GET /medical-records/prescriptions
 * List prescriptions with filters
 * Query: page, limit, pet_id, status, veterinarian_id
 */
router.get('/prescriptions', requireAuth, prescriptionController.listPrescriptions);

/**
 * GET /medical-records/prescriptions/active
 * List active prescriptions
 */
router.get('/prescriptions/active', requireAuth, prescriptionController.listActivePrescriptions);

/**
 * Vet-specific: GET /medical-records/vet/prescriptions/active
 */
router.get('/vet/prescriptions/active', requireAuth, prescriptionController.listActivePrescriptionsForVet);

/**
 * GET /medical-records/prescriptions/:id
 * Get prescription with medications
 */
router.get('/prescriptions/:id', requireAuth, prescriptionController.getPrescriptionById);



/**
 * PATCH /medical-records/prescriptions/:id/status
 * Update prescription status (active, completed, expired, cancelled)
 * Body: { status }
 */
router.patch('/prescriptions/:id/status', requireAuth, prescriptionController.updatePrescriptionStatus);

/**
 * PATCH /medical-records/prescriptions/:id/medications
 * Add medications to existing prescription
 * Body: { medications: [ { medication_name, dosage, frequency, duration, route?, instructions?, quantity?, refills_allowed? }, ... ] }
 */
router.patch('/prescriptions/:id/medications', requireAuth, prescriptionController.updatePrescriptionMedications);

/**
 * DELETE /medical-records/prescriptions/:id
 * Delete prescription and cascade delete all associated medications
 */
router.delete('/prescriptions/:id', requireAuth, prescriptionController.deletePrescription);

// ============================================================================
// LAB TESTS ROUTES
// ============================================================================

/**
 * GET /medical-records/lab-tests
 * List lab tests with filters
 * Query: page, limit, pet_id, status, test_type, medical_record_id
 */
router.get('/lab-tests', requireAuth, labController.listLabTests);


/**
 * GET /medical-records/lab-tests/pending
 * List pending lab tests (status in ordered, sample_collected, processing)
 */
router.get('/lab-tests/pending', requireAuth, labController.listPendingLabTests);

/**
 * Vet-specific: GET /medical-records/vet/lab-tests/pending
 */
router.get('/vet/lab-tests/pending', requireAuth, labController.listPendingLabTestsForVet);

/**
 * GET /medical-records/lab-tests/:id
 * Get specific lab test
 */
router.get('/lab-tests/:id', requireAuth, labController.getLabTestById);

/**
 * GET /medical-records/:medical_record_id/lab-tests
 * Get all lab tests for a medical record (batch created tests)
 * Query: page, limit
 */
router.get('/:medical_record_id/lab-tests', requireAuth, labController.getLabTestsByMedicalRecordId);

/**
 * GET /medical-records/:medical_record_id/vaccinations
 * Get all vaccinations for a medical record (derived from pet_id and appointment_id)
 * Query: page, limit
 */
router.get('/:medical_record_id/vaccinations', requireAuth, vaccinationController.getVaccinationsByMedicalRecordId);

/**
 * POST /medical-records/lab-tests
 * Create lab test order
 * Body: {
 *   medical_record_id, appointment_id, pet_id,
 *   test_name, test_type?, sample_collected_date?, normal_range?, lab_name?, urgency?, cost?
 * }
 */
router.post('/lab-tests', requireAuth, labController.createLabTest);

/**
 * PATCH /medical-records/lab-tests/:id/status
 * Update lab test status and add results
 * Body: { status, results?, interpretation?, result_date? }
 */
router.patch('/lab-tests/:id/status', requireAuth, labController.updateLabTestStatus);

/**
 * PATCH /medical-records/lab-tests/:id
 * Update lab test details (test_type, normal_range, lab_name, urgency, cost)
 * Body: { test_type?, normal_range?, lab_name?, urgency?, cost? }
 */
router.patch('/lab-tests/:id', requireAuth, labController.updateLabTestById);

/**
 * DELETE /medical-records/lab-tests/:id
 * Delete lab test (soft delete)
 */
router.delete('/lab-tests/:id', requireAuth, labController.deleteLabTestById);

// ============================================================================
// VACCINATIONS ROUTES
// ============================================================================

/**
 * GET /medical-records/vaccinations
 * List vaccinations with filters
 * Query: page, limit, pet_id, veterinarian_id, vaccine_type
 */
router.get('/vaccinations', requireAuth, vaccinationController.listVaccinations);

/**
 * GET /medical-records/follow-ups
 * List medical records requiring follow-up or with upcoming followup dates
 */
router.get('/follow-ups', requireAuth, medicalController.listFollowUps);

/**
 * Vet-specific: GET /medical-records/vet/follow-ups
 */
router.get('/vet/follow-ups', requireAuth, medicalController.listFollowUpsForVet);

/**
 * GET /medical-records/vaccinations/:id
 * Get specific vaccination record
 */
router.get('/vaccinations/:id', requireAuth, vaccinationController.getVaccinationById);

/**
 * POST /medical-records/vaccinations
 * Create vaccination record
 * Body: {
 *   pet_id, appointment_id?, veterinarian_id,
 *   vaccine_name, vaccine_type?, manufacturer?, batch_number?,
 *   site_of_injection?, adverse_reactions?, cost?, notes?, next_due_date?
 * }
 */
router.post('/vaccinations', requireAuth, vaccinationController.createVaccination);

/**
 * PATCH /medical-records/vaccinations/:id
 * Update vaccination record (adverse reactions, certificate, next due date)
 * Body: { adverse_reactions?, notes?, certificate_issued?, certificate_number?, next_due_date? }
 */
router.patch('/vaccinations/:id', requireAuth, vaccinationController.updateVaccinations);

/**
 * PATCH /medical-records/records/:medical_record_id/vaccinations
 * Add vaccinations to existing medical record
 * Body: {
 *   pet_id?, appointment_id?, veterinarian_id?,
 *   vaccinations: [ { vaccine_name, vaccine_type?, manufacturer?, batch_number?, 
 *                     site_of_injection?, adverse_reactions?, cost?, notes?, next_due_date? }, ... ]
 * }
 */
router.patch('/records/:medical_record_id/vaccinations', requireAuth, vaccinationController.updateVaccinations);

/**
 * DELETE /medical-records/vaccinations/:id
 * Soft delete vaccination record
 */
router.delete('/vaccinations/:id', requireAuth, vaccinationController.deleteVaccination);

module.exports = router;