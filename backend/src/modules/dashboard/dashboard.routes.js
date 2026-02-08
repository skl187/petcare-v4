// src/modules/dashboard/dashboard.routes.js
// ============================================================================
// Dashboard Summary Routes - Admin, Owner, Veterinarian
// ============================================================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

// Simple validation handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

/**
 * GET /api/dashboard/admin/summary
 * Get comprehensive admin dashboard summary
 * Includes: users, pets, appointments, revenue, clinics, veterinarians, payments
 * Requires: Admin authentication
 */
router.get('/admin/summary', requireAuth, dashboardController.getAdminDashboardSummary);

// ============================================================================
// OWNER DASHBOARD
// ============================================================================

/**
 * GET /api/dashboard/owner/summary
 * Get pet owner dashboard summary
 * Includes: pets, appointments, medical records, vaccination alerts, insurance, payments
 * Requires: Owner authentication (uses req.user.id)
 */
router.get('/owner/summary', requireAuth, dashboardController.getOwnerDashboardSummary);

// ============================================================================
// VETERINARIAN DASHBOARD
// ============================================================================

/**
 * GET /api/dashboard/veterinarian/summary
 * Get veterinarian dashboard summary
 * Includes: profile, appointments (today/upcoming), patients, earnings, reviews, pending records
 * Requires: Veterinarian authentication (uses req.user.id to find vet profile)
 */
router.get('/veterinarian/summary', requireAuth, dashboardController.getVeterinarianDashboardSummary);

// GET /api/dashboard/profile - Current authenticated user's profile
router.get('/profile', requireAuth, dashboardController.getUserProfile);

// PATCH /api/dashboard/profile - Update authenticated user's profile (partial)
router.patch('/profile',
  requireAuth,
  [
    // Ensure at least one updatable field is present. Extra/unknown fields (e.g., email) will be ignored by the controller.
    body().custom(value => {
      const allowed = ['first_name','last_name','display_name','avatar_url','bio','phone'];
      if (!value || Object.keys(value).length === 0) {
        throw new Error('At least one field must be provided');
      }
      const hasAllowed = Object.keys(value).some(k => allowed.includes(k));
      if (!hasAllowed) throw new Error('Request must include at least one of: ' + allowed.join(', '));
      return true;
    })
  ],
  handleValidationErrors,
  dashboardController.updateUserProfile
);

module.exports = router;
