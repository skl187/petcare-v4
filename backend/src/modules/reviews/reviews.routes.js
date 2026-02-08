// src/modules/reviews/reviews.routes.js
// ============================================================================
// Veterinary Appointment Reviews Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

// ============================================================================
// PUBLIC ROUTES (with auth for user context)
// ============================================================================

// Get reviews for a specific veterinarian (public view)
router.get('/veterinarian/:veterinarianId', reviewsController.getVeterinarianReviews);

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

// Get current user's reviews
router.get('/my-reviews', requireAuth, reviewsController.getMyReviews);

// Get appointments pending review for current user
router.get('/pending', requireAuth, reviewsController.getPendingReviewAppointments);

// Check if user can review an appointment
router.get('/can-review/:appointmentId', requireAuth, reviewsController.canReviewAppointment);

// Get review for a specific appointment
router.get('/appointment/:appointmentId', requireAuth, reviewsController.getReviewByAppointment);

// Create a new review
router.post('/', requireAuth, reviewsController.createReview);

// Update a review
router.put('/:id', requireAuth, reviewsController.updateReview);

// Delete a review (soft delete)
router.delete('/:id', requireAuth, reviewsController.deleteReview);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// List all reviews (admin)
router.get('/', requireAuth, reviewsController.listReviews);

// Get single review by ID
router.get('/:id', requireAuth, reviewsController.getReview);

module.exports = router;
