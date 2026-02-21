const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../core/auth/auth.middleware');
const {
  // Admin
  adminListServices,
  adminGetService,
  adminUpdateService,
  adminDeleteService,
  // Vet
  vetGetMappedClinics,
  vetCreateService,
  vetListServices,
  vetUpdateService,
  vetDeleteService,
  // Public / booking
  getActiveServicesForBooking
} = require('./vet_services.controller');

// ─────────────────────────────────────────────────────────────
// PUBLIC — used during appointment booking
// GET /api/vet-services/active?vet_id=&clinic_id=
//   Returns only status=1 services (disabled ones are excluded)
// ─────────────────────────────────────────────────────────────
router.get('/active', getActiveServicesForBooking);

// ─────────────────────────────────────────────────────────────
// VET routes  (role: vet)
// ─────────────────────────────────────────────────────────────

// GET /api/vet-services/my/clinics
//   Returns all clinics this vet is mapped to (for service-create dropdown)
router.get(
  '/my/clinics',
  requireAuth,
  vetGetMappedClinics
);

// GET /api/vet-services/my
//   List own services; supports ?clinic_id= ?status= ?page= ?limit=
router.get(
  '/my',
  requireAuth,
  vetListServices
);

// POST /api/vet-services/my
//   Create a service and attach it to a clinic mapping
//   Body: { clinic_id, name, code?, description?, default_duration_minutes?, default_fee?, service_type? }
router.post(
  '/my',
  requireAuth,
  vetCreateService
);

// PATCH /api/vet-services/my/:id
//   Update own service (name, description, default_duration_minutes, default_fee,
//                        service_type, code, status [1=active, 0=disabled])
router.patch(
  '/my/:id',
  requireAuth,
  vetUpdateService
);

// DELETE /api/vet-services/my/:id
//   Soft-delete own service and remove from clinic mapping
router.delete(
  '/my/:id',
  requireAuth,
  vetDeleteService
);

// ─────────────────────────────────────────────────────────────
// ADMIN routes  (role: admin)
// ─────────────────────────────────────────────────────────────

// GET /api/vet-services
//   List all services with clinic name, vet name, cost and details
//   Supports: ?status= ?search= ?page= ?limit=
router.get(
  '/',
  requireAuth,
  adminListServices
);

// GET /api/vet-services/:id
//   Single service with full clinic+vet mapping info
router.get(
  '/:id',
  requireAuth,
  adminGetService
);

// PATCH /api/vet-services/:id
//   Admin can update any service
router.patch(
  '/:id',
  requireAuth,
  adminUpdateService
);

// DELETE /api/vet-services/:id
//   Admin soft-deletes service and removes it from all mappings
router.delete(
  '/:id',
  requireAuth,
  adminDeleteService
);

module.exports = router;