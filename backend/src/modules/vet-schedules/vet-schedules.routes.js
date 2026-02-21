// src/modules/vet-schedules/vet-schedules.routes.js - ROUTES
// ============================================================

const express = require('express');
const router = express.Router();
const controller = require('./vet-schedules.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

// ============================================================
// EXCEPTIONS (must be defined before generic /:id routes)
// ============================================================

// GET  /api/vet-schedules/exceptions?veterinarian_id=&clinic_id=&from_date=&to_date=
router.get('/exceptions', requireAuth, controller.listExceptions);

// POST /api/vet-schedules/exceptions
router.post('/exceptions', requireAuth, controller.createException);

// DELETE /api/vet-schedules/exceptions/:id
router.delete('/exceptions/:id', requireAuth, controller.deleteException);

// ============================================================
// SCHEDULES (generic routes defined after specific ones)
// ============================================================

// GET  /api/vet-schedules?veterinarian_id=&clinic_id=
router.get('/', requireAuth, controller.listSchedules);

// POST /api/vet-schedules
router.post('/', requireAuth, controller.upsertSchedule);

// PUT  /api/vet-schedules/bulk
router.put('/bulk', requireAuth, controller.bulkUpsertSchedules);

// DELETE /api/vet-schedules/:id
router.delete('/:id', requireAuth, controller.deleteSchedule);

module.exports = router;
