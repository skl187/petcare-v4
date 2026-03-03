const express = require('express');
const router = express.Router();
const controller = require('./vet-schedules.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

// ═══════════════════════════════════════════════════════════
// EXCEPTIONS — defined before /:id to avoid route conflicts
// ═══════════════════════════════════════════════════════════

// GET  /api/vet-schedules/exceptions/my?clinic_id=&from_date=&to_date=
//   Vet fetches their own exceptions
router.get('/exceptions/my', requireAuth, controller.getMyExceptions);

// GET  /api/vet-schedules/exceptions?veterinarian_id=&clinic_id=&from_date=&to_date=
//   Admin fetches exceptions for any vet
router.get('/exceptions', requireAuth, controller.listExceptions);

// POST /api/vet-schedules/exceptions
//   { exception_date, exception_type, clinic_id?, start_time?, end_time?, reason?, is_recurring? }
router.post('/exceptions/my', requireAuth, controller.createException);

// PATCH /api/vet-schedules/exceptions/:id
//   Update any field on an exception
router.patch('/exceptions/:id', requireAuth, controller.updateException);

// DELETE /api/vet-schedules/exceptions/:id
router.delete('/exceptions/:id', requireAuth, controller.deleteException);

// ═══════════════════════════════════════════════════════════
// WEEKLY SCHEDULES
// ═══════════════════════════════════════════════════════════

// PUT  /api/vet-schedules/my/bulk  ← Save Schedule button (frontend calls this)
router.put('/my/bulk', requireAuth, controller.bulkUpsertSchedules);

// GET  /api/vet-schedules/my?clinic_id=
//   Vet fetches their own weekly schedule (used by UI)
router.get('/my', requireAuth, controller.getMySchedules);

// GET  /api/vet-schedules?veterinarian_id=&clinic_id=
//   Admin fetches schedule for any vet
router.get('/', requireAuth, controller.listSchedules);

// PUT  /api/vet-schedules/bulk  ← Save Schedule button
//   { clinic_id, schedules: [{ day_of_week, start_time, end_time, slot_duration, max_appointments_per_slot, is_available }] }
//   Replaces all schedules for the authenticated vet + clinic atomically
router.put('/bulk', requireAuth, controller.bulkUpsertSchedules);

// POST /api/vet-schedules
//   Upsert a single day — { clinic_id, day_of_week, start_time, end_time, ... }
router.post('/', requireAuth, controller.upsertSchedule);

// PATCH /api/vet-schedules/:id
//   Partial update — toggle is_available, change times, etc.
router.patch('/:id', requireAuth, controller.updateSchedule);

// DELETE /api/vet-schedules/:id
//   Soft-delete a single day's schedule
router.delete('/:id', requireAuth, controller.deleteSchedule);

module.exports = router;