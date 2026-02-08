// src/modules/dashboard/dashboard.routes.js
// ============================================================================
// Dashboard Summary Routes - Admin, Owner, Veterinarian
// ============================================================================

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

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

module.exports = router;
