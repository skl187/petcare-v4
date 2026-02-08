// src/modules/reviews/reviews.controller.js
// ============================================================================
// Veterinary Appointment Reviews Controller
// ============================================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

// ============================================================================
// LIST ALL REVIEWS (Admin)
// ============================================================================
const listReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, veterinarian_id, user_id, rating_min, rating_max } = req.query;
    const offset = (page - 1) * limit;

    let where = 'r.deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (status) {
      where += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (veterinarian_id) {
      where += ` AND r.veterinarian_id = $${paramIndex}`;
      params.push(veterinarian_id);
      paramIndex++;
    }
    if (user_id) {
      where += ` AND r.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }
    if (rating_min) {
      where += ` AND r.rating >= $${paramIndex}`;
      params.push(parseFloat(rating_min));
      paramIndex++;
    }
    if (rating_max) {
      where += ` AND r.rating <= $${paramIndex}`;
      params.push(parseFloat(rating_max));
      paramIndex++;
    }

    params.push(parseInt(limit));
    params.push(parseInt(offset));
    const limitIndex = paramIndex;
    const offsetIndex = paramIndex + 1;

    const result = await query(
      `SELECT
        r.id, r.rating, r.review_text, r.status,
        r.professionalism_rating, r.knowledge_rating, r.communication_rating, r.facility_rating,
        r.is_anonymous, r.is_verified,
        r.created_at, r.updated_at,
        a.id as appointment_id, a.appointment_number, a.appointment_date,
        u.id as user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
        p.id as pet_id, p.name as pet_name,
        v.id as veterinarian_id,
        vu.first_name as vet_first_name, vu.last_name as vet_last_name,
        c.id as clinic_id, c.name as clinic_name
      FROM vet_reviews r
      LEFT JOIN vet_appointments a ON r.appointment_id = a.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN veterinarians v ON r.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      LEFT JOIN vet_clinics c ON a.clinic_id = c.id
      WHERE ${where}
      ORDER BY r.created_at DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params
    );

    const countParams = params.slice(0, params.length - 2);
    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_reviews r WHERE ${where}`,
      countParams
    );

    res.json(successResponse({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    }, 'Reviews retrieved successfully'));

  } catch (err) {
    console.error('List reviews error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve reviews' });
  }
};

// ============================================================================
// GET SINGLE REVIEW
// ============================================================================
const getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        r.id, r.rating, r.review_text, r.status,
        r.professionalism_rating, r.knowledge_rating, r.communication_rating, r.facility_rating,
        r.is_anonymous, r.is_verified,
        r.created_at, r.updated_at,
        a.id as appointment_id, a.appointment_number, a.appointment_date, a.appointment_type,
        u.id as user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
        p.id as pet_id, p.name as pet_name,
        v.id as veterinarian_id,
        vu.first_name as vet_first_name, vu.last_name as vet_last_name,
        c.id as clinic_id, c.name as clinic_name
      FROM vet_reviews r
      LEFT JOIN vet_appointments a ON r.appointment_id = a.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN veterinarians v ON r.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      LEFT JOIN vet_clinics c ON a.clinic_id = c.id
      WHERE r.id = $1 AND r.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }

    res.json(successResponse(result.rows[0], 'Review retrieved successfully'));

  } catch (err) {
    console.error('Get review error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve review' });
  }
};

// ============================================================================
// GET REVIEWS BY APPOINTMENT
// ============================================================================
const getReviewByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const result = await query(
      `SELECT
        r.id, r.rating, r.review_text, r.status,
        r.professionalism_rating, r.knowledge_rating, r.communication_rating, r.facility_rating,
        r.is_anonymous, r.is_verified,
        r.created_at, r.updated_at,
        u.id as user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
        vu.first_name as vet_first_name, vu.last_name as vet_last_name
      FROM vet_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN veterinarians v ON r.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      WHERE r.appointment_id = $1 AND r.deleted_at IS NULL`,
      [appointmentId]
    );

    if (result.rows.length === 0) {
      return res.json(successResponse(null, 'No review found for this appointment'));
    }

    res.json(successResponse(result.rows[0], 'Review retrieved successfully'));

  } catch (err) {
    console.error('Get review by appointment error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve review' });
  }
};

// ============================================================================
// GET REVIEWS FOR A VETERINARIAN
// ============================================================================
const getVeterinarianReviews = async (req, res) => {
  try {
    const { veterinarianId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT
        r.id, r.rating, r.review_text, r.status,
        r.professionalism_rating, r.knowledge_rating, r.communication_rating, r.facility_rating,
        r.is_anonymous, r.is_verified,
        r.created_at,
        a.id as appointment_id, a.appointment_date, a.appointment_type,
        CASE WHEN r.is_anonymous THEN NULL ELSE u.first_name END as owner_first_name,
        CASE WHEN r.is_anonymous THEN NULL ELSE u.last_name END as owner_last_name,
        p.name as pet_name
      FROM vet_reviews r
      LEFT JOIN vet_appointments a ON r.appointment_id = a.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      WHERE r.veterinarian_id = $1
        AND r.deleted_at IS NULL
        AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`,
      [veterinarianId, parseInt(limit), parseInt(offset)]
    );

    // Get summary statistics
    const statsResult = await query(
      `SELECT
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COALESCE(AVG(professionalism_rating), 0) as avg_professionalism,
        COALESCE(AVG(knowledge_rating), 0) as avg_knowledge,
        COALESCE(AVG(communication_rating), 0) as avg_communication,
        COALESCE(AVG(facility_rating), 0) as avg_facility,
        COUNT(*) FILTER (WHERE rating >= 4) as positive_reviews,
        COUNT(*) FILTER (WHERE rating < 3) as negative_reviews
      FROM vet_reviews
      WHERE veterinarian_id = $1 AND deleted_at IS NULL AND status = 'approved'`,
      [veterinarianId]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_reviews
       WHERE veterinarian_id = $1 AND deleted_at IS NULL AND status = 'approved'`,
      [veterinarianId]
    );

    res.json(successResponse({
      reviews: result.rows,
      stats: statsResult.rows[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    }, 'Veterinarian reviews retrieved successfully'));

  } catch (err) {
    console.error('Get veterinarian reviews error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve veterinarian reviews' });
  }
};

// ============================================================================
// GET MY REVIEWS (Pet Owner)
// ============================================================================
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT
        r.id, r.rating, r.review_text, r.status,
        r.professionalism_rating, r.knowledge_rating, r.communication_rating, r.facility_rating,
        r.is_anonymous, r.is_verified,
        r.created_at, r.updated_at,
        a.id as appointment_id, a.appointment_number, a.appointment_date, a.appointment_type,
        p.name as pet_name,
        vu.first_name as vet_first_name, vu.last_name as vet_last_name,
        c.name as clinic_name
      FROM vet_reviews r
      LEFT JOIN vet_appointments a ON r.appointment_id = a.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN veterinarians v ON r.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      LEFT JOIN vet_clinics c ON a.clinic_id = c.id
      WHERE r.user_id = $1 AND r.deleted_at IS NULL
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_reviews
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    res.json(successResponse({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    }, 'Your reviews retrieved successfully'));

  } catch (err) {
    console.error('Get my reviews error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve your reviews' });
  }
};

// ============================================================================
// CHECK IF USER CAN REVIEW AN APPOINTMENT
// ============================================================================
const canReviewAppointment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { appointmentId } = req.params;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Check if appointment exists, belongs to user, and is completed
    const appointmentResult = await query(
      `SELECT id, status, user_id, veterinarian_id
       FROM vet_appointments
       WHERE id = $1 AND deleted_at IS NULL`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.json(successResponse({
        can_review: false,
        reason: 'Appointment not found'
      }));
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.user_id !== userId) {
      return res.json(successResponse({
        can_review: false,
        reason: 'This is not your appointment'
      }));
    }

    if (appointment.status !== 'completed') {
      return res.json(successResponse({
        can_review: false,
        reason: 'Appointment must be completed before reviewing'
      }));
    }

    // Check if already reviewed
    const existingReview = await query(
      `SELECT id FROM vet_reviews
       WHERE appointment_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [appointmentId, userId]
    );

    if (existingReview.rows.length > 0) {
      return res.json(successResponse({
        can_review: false,
        reason: 'You have already reviewed this appointment',
        existing_review_id: existingReview.rows[0].id
      }));
    }

    res.json(successResponse({
      can_review: true,
      veterinarian_id: appointment.veterinarian_id
    }, 'You can review this appointment'));

  } catch (err) {
    console.error('Can review appointment error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to check review eligibility' });
  }
};

// ============================================================================
// CREATE REVIEW
// ============================================================================
const createReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const {
      appointment_id,
      rating,
      review_text,
      professionalism_rating,
      knowledge_rating,
      communication_rating,
      facility_rating,
      is_anonymous
    } = req.body;

    // Validate required fields
    if (!appointment_id || !rating) {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment ID and rating are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if appointment exists and belongs to user
    const appointmentResult = await query(
      `SELECT id, status, user_id, veterinarian_id
       FROM vet_appointments
       WHERE id = $1 AND deleted_at IS NULL`,
      [appointment_id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.user_id !== userId) {
      return res.status(403).json({ status: 'error', message: 'You can only review your own appointments' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ status: 'error', message: 'Appointment must be completed before reviewing' });
    }

    // Check if already reviewed
    const existingReview = await query(
      `SELECT id FROM vet_reviews
       WHERE appointment_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [appointment_id, userId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'You have already reviewed this appointment' });
    }

    // Create the review
    const result = await query(
      `INSERT INTO vet_reviews (
        appointment_id, veterinarian_id, user_id,
        rating, review_text,
        professionalism_rating, knowledge_rating, communication_rating, facility_rating,
        is_anonymous, is_verified, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, 'approved')
      RETURNING *`,
      [
        appointment_id,
        appointment.veterinarian_id,
        userId,
        rating,
        review_text || null,
        professionalism_rating || null,
        knowledge_rating || null,
        communication_rating || null,
        facility_rating || null,
        is_anonymous || false
      ]
    );

    // Update veterinarian's average rating
    await updateVeterinarianRating(appointment.veterinarian_id);

    res.status(201).json(successResponse(result.rows[0], 'Review submitted successfully'));

  } catch (err) {
    console.error('Create review error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create review' });
  }
};

// ============================================================================
// UPDATE REVIEW (Owner can update their own, Admin can update any)
// ============================================================================
const updateReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Get existing review
    const existingResult = await query(
      `SELECT * FROM vet_reviews WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }

    const existingReview = existingResult.rows[0];

    // Check permissions - owner can update their own, admin can update any
    if (existingReview.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You can only update your own reviews' });
    }

    const {
      rating,
      review_text,
      professionalism_rating,
      knowledge_rating,
      communication_rating,
      facility_rating,
      is_anonymous,
      status // Admin only
    } = req.body;

    // Build update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ status: 'error', message: 'Rating must be between 1 and 5' });
      }
      updates.push(`rating = $${paramIndex}`);
      params.push(rating);
      paramIndex++;
    }
    if (review_text !== undefined) {
      updates.push(`review_text = $${paramIndex}`);
      params.push(review_text);
      paramIndex++;
    }
    if (professionalism_rating !== undefined) {
      updates.push(`professionalism_rating = $${paramIndex}`);
      params.push(professionalism_rating);
      paramIndex++;
    }
    if (knowledge_rating !== undefined) {
      updates.push(`knowledge_rating = $${paramIndex}`);
      params.push(knowledge_rating);
      paramIndex++;
    }
    if (communication_rating !== undefined) {
      updates.push(`communication_rating = $${paramIndex}`);
      params.push(communication_rating);
      paramIndex++;
    }
    if (facility_rating !== undefined) {
      updates.push(`facility_rating = $${paramIndex}`);
      params.push(facility_rating);
      paramIndex++;
    }
    if (is_anonymous !== undefined) {
      updates.push(`is_anonymous = $${paramIndex}`);
      params.push(is_anonymous);
      paramIndex++;
    }
    // Only admin can update status
    if (status !== undefined && userRole === 'admin') {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    params.push(id);
    const result = await query(
      `UPDATE vet_reviews SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    // Update veterinarian's average rating if rating was changed
    if (rating !== undefined) {
      await updateVeterinarianRating(existingReview.veterinarian_id);
    }

    res.json(successResponse(result.rows[0], 'Review updated successfully'));

  } catch (err) {
    console.error('Update review error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update review' });
  }
};

// ============================================================================
// DELETE REVIEW (Soft delete)
// ============================================================================
const deleteReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Get existing review
    const existingResult = await query(
      `SELECT * FROM vet_reviews WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }

    const existingReview = existingResult.rows[0];

    // Check permissions - owner can delete their own, admin can delete any
    if (existingReview.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'You can only delete your own reviews' });
    }

    // Soft delete
    await query(
      `UPDATE vet_reviews SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );

    // Update veterinarian's average rating
    await updateVeterinarianRating(existingReview.veterinarian_id);

    res.json(successResponse(null, 'Review deleted successfully'));

  } catch (err) {
    console.error('Delete review error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete review' });
  }
};

// ============================================================================
// GET APPOINTMENTS PENDING REVIEW (for pet owner)
// ============================================================================
const getPendingReviewAppointments = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const result = await query(
      `SELECT
        a.id, a.appointment_number, a.appointment_date, a.appointment_time, a.appointment_type,
        p.name as pet_name,
        vu.first_name as vet_first_name, vu.last_name as vet_last_name,
        v.id as veterinarian_id,
        c.name as clinic_name
      FROM vet_appointments a
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      LEFT JOIN vet_clinics c ON a.clinic_id = c.id
      WHERE a.user_id = $1
        AND a.status = 'completed'
        AND a.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM vet_reviews r
          WHERE r.appointment_id = a.id AND r.user_id = $1 AND r.deleted_at IS NULL
        )
      ORDER BY a.appointment_date DESC
      LIMIT 10`,
      [userId]
    );

    res.json(successResponse({
      appointments: result.rows,
      count: result.rows.length
    }, 'Pending review appointments retrieved successfully'));

  } catch (err) {
    console.error('Get pending review appointments error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve pending review appointments' });
  }
};

// ============================================================================
// HELPER: Update Veterinarian Average Rating
// ============================================================================
const updateVeterinarianRating = async (veterinarianId) => {
  try {
    const result = await query(
      `SELECT
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as total_reviews
      FROM vet_reviews
      WHERE veterinarian_id = $1 AND deleted_at IS NULL AND status = 'approved'`,
      [veterinarianId]
    );

    const { avg_rating } = result.rows[0];

    await query(
      `UPDATE veterinarians SET rating = $1, updated_at = NOW() WHERE id = $2`,
      [parseFloat(avg_rating).toFixed(2), veterinarianId]
    );

  } catch (err) {
    console.error('Update veterinarian rating error:', err.message);
  }
};

module.exports = {
  listReviews,
  getReview,
  getReviewByAppointment,
  getVeterinarianReviews,
  getMyReviews,
  canReviewAppointment,
  createReview,
  updateReview,
  deleteReview,
  getPendingReviewAppointments
};
