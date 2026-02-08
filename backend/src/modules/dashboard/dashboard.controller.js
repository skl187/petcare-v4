// src/modules/dashboard/dashboard.controller.js
// ============================================================================
// Dashboard Summary Controller - Admin, Owner, Veterinarian Dashboards
// ============================================================================

const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

// ============================================================================
// ADMIN DASHBOARD SUMMARY
// ============================================================================
const getAdminDashboardSummary = async (req, res) => {
  try {
    // Execute all queries in parallel for performance
    const [
      userStats,
      petStats,
      appointmentStats,
      todayAppointments,
      revenueStats,
      clinicStats,
      vetStats,
      recentAppointments,
      paymentStats
    ] = await Promise.all([
      // User statistics
      query(`
        SELECT
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_users,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'active') as active_users,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'pending') as pending_users,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'suspended') as suspended_users,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_last_30_days,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_last_7_days
        FROM users
      `),

      // Pet statistics
      query(`
        SELECT
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_pets,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE - INTERVAL '30 days') as new_pets_last_30_days
        FROM pets
      `),

      // Appointment statistics by status
      query(`
        SELECT
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_appointments,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'scheduled') as scheduled,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'in_progress') as in_progress,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'completed') as completed,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'cancelled') as cancelled,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'no_show') as no_show,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'rescheduled') as rescheduled
        FROM vet_appointments
      `),

      // Today's appointments
      query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
        FROM vet_appointments
        WHERE appointment_date = CURRENT_DATE AND deleted_at IS NULL
      `),

      // Revenue statistics
      query(`
        SELECT
          COALESCE(SUM(total_amount) FILTER (WHERE deleted_at IS NULL AND payment_status = 'paid'), 0) as total_revenue,
          COALESCE(SUM(total_amount) FILTER (WHERE deleted_at IS NULL AND payment_status = 'paid' AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as revenue_last_30_days,
          COALESCE(SUM(total_amount) FILTER (WHERE deleted_at IS NULL AND payment_status = 'paid' AND appointment_date >= CURRENT_DATE - INTERVAL '7 days'), 0) as revenue_last_7_days,
          COALESCE(SUM(total_amount) FILTER (WHERE deleted_at IS NULL AND payment_status = 'paid' AND appointment_date = CURRENT_DATE), 0) as revenue_today,
          COALESCE(SUM(total_amount) FILTER (WHERE deleted_at IS NULL AND payment_status = 'pending'), 0) as pending_revenue
        FROM vet_appointments
      `),

      // Clinic statistics
      query(`
        SELECT
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_clinics,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 1) as active_clinics,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_24x7 = true) as clinics_24x7,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_emergency_available = true) as emergency_clinics
        FROM vet_clinics
      `),

      // Veterinarian statistics
      query(`
        SELECT
          COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_vets,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 1) as active_vets,
          COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_available_for_emergency = true) as emergency_vets,
          COALESCE(AVG(rating) FILTER (WHERE deleted_at IS NULL AND rating > 0), 0) as avg_rating
        FROM veterinarians
      `),

      // Recent appointments (last 5)
      query(`
        SELECT
          a.id, a.appointment_number, a.appointment_date, a.appointment_time,
          a.status, a.appointment_type, a.total_amount, a.payment_status,
          u.first_name as user_first_name, u.last_name as user_last_name,
          p.name as pet_name,
          vu.first_name as vet_first_name, vu.last_name as vet_last_name,
          c.name as clinic_name
        FROM vet_appointments a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
        LEFT JOIN users vu ON v.user_id = vu.id
        LEFT JOIN vet_clinics c ON a.clinic_id = c.id
        WHERE a.deleted_at IS NULL
        ORDER BY a.created_at DESC
        LIMIT 5
      `),

      // Payment statistics
      query(`
        SELECT
          COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_payments,
          COUNT(*) FILTER (WHERE payment_status = 'paid') as completed_payments,
          COUNT(*) FILTER (WHERE payment_status = 'partially_paid') as partial_payments,
          COUNT(*) FILTER (WHERE payment_status = 'refunded') as refunded_payments
        FROM vet_appointments
        WHERE deleted_at IS NULL
      `)
    ]);

    // Get top clinics by appointments
    const topClinics = await query(`
      SELECT
        c.id, c.name, c.slug,
        COUNT(a.id) as total_appointments,
        COALESCE(SUM(a.total_amount) FILTER (WHERE a.payment_status = 'paid'), 0) as total_revenue
      FROM vet_clinics c
      LEFT JOIN vet_appointments a ON c.id = a.clinic_id AND a.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.id, c.name, c.slug
      ORDER BY total_appointments DESC
      LIMIT 5
    `);

    // Get top veterinarians by appointments
    const topVets = await query(`
      SELECT
        v.id, vu.first_name, vu.last_name, v.specialization, v.rating,
        COUNT(a.id) as total_appointments,
        COALESCE(SUM(a.total_amount) FILTER (WHERE a.payment_status = 'paid'), 0) as total_revenue
      FROM veterinarians v
      LEFT JOIN users vu ON v.user_id = vu.id
      LEFT JOIN vet_appointments a ON v.id = a.veterinarian_id AND a.deleted_at IS NULL
      WHERE v.deleted_at IS NULL
      GROUP BY v.id, vu.first_name, vu.last_name, v.specialization, v.rating
      ORDER BY total_appointments DESC
      LIMIT 5
    `);

    // Get appointment trends (last 7 days)
    const appointmentTrends = await query(`
      SELECT
        appointment_date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
      FROM vet_appointments
      WHERE appointment_date >= CURRENT_DATE - INTERVAL '7 days'
        AND appointment_date <= CURRENT_DATE
        AND deleted_at IS NULL
      GROUP BY appointment_date
      ORDER BY appointment_date ASC
    `);

    res.json(successResponse({
      users: userStats.rows[0],
      pets: petStats.rows[0],
      appointments: {
        overview: appointmentStats.rows[0],
        today: todayAppointments.rows[0],
        recent: recentAppointments.rows,
        trends: appointmentTrends.rows
      },
      revenue: revenueStats.rows[0],
      clinics: {
        stats: clinicStats.rows[0],
        top: topClinics.rows
      },
      veterinarians: {
        stats: vetStats.rows[0],
        top: topVets.rows
      },
      payments: paymentStats.rows[0]
    }, 'Admin dashboard summary retrieved successfully'));

  } catch (err) {
    console.error('Admin dashboard summary error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch admin dashboard summary' });
  }
};

// ============================================================================
// OWNER DASHBOARD SUMMARY
// ============================================================================
const getOwnerDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Execute all queries in parallel
    const [
      petStats,
      appointmentStats,
      upcomingAppointments,
      recentMedicalRecords,
      vaccinationAlerts,
      paymentHistory
    ] = await Promise.all([
      // Pet statistics for this owner
      query(`
        SELECT
          COUNT(*) as total_pets,
          COUNT(*) FILTER (WHERE status = 1) as active_pets
        FROM pets
        WHERE user_id = $1 AND deleted_at IS NULL
      `, [userId]),

      // Appointment statistics for this owner
      query(`
        SELECT
          COUNT(*) as total_appointments,
          COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
          COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE) as today,
          COUNT(*) FILTER (WHERE appointment_date > CURRENT_DATE) as upcoming,
          COUNT(*) FILTER (WHERE appointment_date < CURRENT_DATE AND status = 'completed') as past_completed,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_spent,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'pending'), 0) as pending_payments
        FROM vet_appointments
        WHERE user_id = $1 AND deleted_at IS NULL
      `, [userId]),

      // Upcoming appointments (next 5)
      query(`
        SELECT
          a.id, a.appointment_number, a.appointment_date, a.appointment_time,
          a.status, a.appointment_type, a.chief_complaint, a.total_amount, a.payment_status,
          p.id as pet_id, p.name as pet_name,
          vu.first_name as vet_first_name, vu.last_name as vet_last_name, v.specialization,
          c.name as clinic_name, c.contact_number as clinic_phone
        FROM vet_appointments a
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
        LEFT JOIN users vu ON v.user_id = vu.id
        LEFT JOIN vet_clinics c ON a.clinic_id = c.id
        WHERE a.user_id = $1
          AND a.appointment_date >= CURRENT_DATE
          AND a.status IN ('scheduled', 'confirmed')
          AND a.deleted_at IS NULL
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
        LIMIT 5
      `, [userId]),

      // Recent medical records (last 5)
      query(`
        SELECT
          mr.id, mr.record_type, mr.record_date, mr.diagnosis,
          mr.followup_required, mr.followup_date,
          p.id as pet_id, p.name as pet_name,
          vu.first_name as vet_first_name, vu.last_name as vet_last_name
        FROM vet_medical_records mr
        LEFT JOIN pets p ON mr.pet_id = p.id
        LEFT JOIN veterinarians v ON mr.veterinarian_id = v.id
        LEFT JOIN users vu ON v.user_id = vu.id
        WHERE p.user_id = $1 AND mr.deleted_at IS NULL
        ORDER BY mr.record_date DESC
        LIMIT 5
      `, [userId]),

      // Vaccination alerts (due within 30 days or overdue)
      query(`
        SELECT
          vac.id, vac.vaccine_name, vac.vaccination_date, vac.next_due_date,
          p.id as pet_id, p.name as pet_name,
          CASE
            WHEN vac.next_due_date < CURRENT_DATE THEN 'overdue'
            WHEN vac.next_due_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'due_soon'
            ELSE 'ok'
          END as alert_status
        FROM vet_vaccinations vac
        LEFT JOIN pets p ON vac.pet_id = p.id
        WHERE p.user_id = $1
          AND vac.next_due_date IS NOT NULL
          AND vac.next_due_date <= CURRENT_DATE + INTERVAL '30 days'
          AND vac.deleted_at IS NULL
        ORDER BY vac.next_due_date ASC
        LIMIT 10
      `, [userId]),

      // Payment history summary (from vet_appointments)
      query(`
        SELECT
          COUNT(*) as total_transactions,
          COALESCE(SUM(total_amount), 0) as total_amount,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_paid,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'pending'), 0) as total_pending,
          COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_count
        FROM vet_appointments
        WHERE user_id = $1 AND deleted_at IS NULL
      `, [userId])
    ]);

    // Get pets with their details
    const pets = await query(`
      SELECT
        p.id, p.name, p.gender, p.date_of_birth, p.age, p.weight, p.status,
        pt.name as pet_type,
        b.name as breed,
        (SELECT COUNT(*) FROM vet_appointments a WHERE a.pet_id = p.id AND a.deleted_at IS NULL) as total_appointments,
        (SELECT COUNT(*) FROM vet_medical_records mr WHERE mr.pet_id = p.id AND mr.deleted_at IS NULL) as total_records,
        (SELECT MAX(vaccination_date) FROM vet_vaccinations v WHERE v.pet_id = p.id AND v.deleted_at IS NULL) as last_vaccination
      FROM pets p
      LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
      LEFT JOIN breeds b ON p.breed_id = b.id
      WHERE p.user_id = $1 AND p.deleted_at IS NULL
      ORDER BY p.name ASC
    `, [userId]);

    res.json(successResponse({
      pets: {
        stats: petStats.rows[0],
        list: pets.rows
      },
      appointments: {
        stats: appointmentStats.rows[0],
        upcoming: upcomingAppointments.rows
      },
      medical: {
        recent_records: recentMedicalRecords.rows,
        vaccination_alerts: vaccinationAlerts.rows
      },
      insurance: null, // TODO: Add pet_insurance_policies table
      payments: paymentHistory.rows[0]
    }, 'Owner dashboard summary retrieved successfully'));

  } catch (err) {
    console.error('Owner dashboard summary error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch owner dashboard summary' });
  }
};

// ============================================================================
// VETERINARIAN DASHBOARD SUMMARY
// ============================================================================
const getVeterinarianDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Get veterinarian profile
    const vetResult = await query(
      'SELECT id, license_number, specialization, consultation_fee, rating, total_appointments FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (vetResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Veterinarian profile not found' });
    }

    const vetId = vetResult.rows[0].id;
    const vetProfile = vetResult.rows[0];

    // Execute all queries in parallel
    const [
      appointmentStats,
      todayAppointments,
      upcomingAppointments,
      patientStats,
      earningsStats,
      reviewStats,
      pendingRecords,
      recentPatients
    ] = await Promise.all([
      // Overall appointment statistics
      query(`
        SELECT
          COUNT(*) as total_appointments,
          COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
          COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
          COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE) as today_total,
          COUNT(*) FILTER (WHERE appointment_date > CURRENT_DATE AND status IN ('scheduled', 'confirmed')) as upcoming_total,
          COUNT(*) FILTER (WHERE appointment_date >= CURRENT_DATE - INTERVAL '7 days' AND appointment_date <= CURRENT_DATE) as this_week,
          COUNT(*) FILTER (WHERE appointment_date >= CURRENT_DATE - INTERVAL '30 days') as this_month
        FROM vet_appointments
        WHERE veterinarian_id = $1 AND deleted_at IS NULL
      `, [vetId]),

      // Today's appointments with details
      query(`
        SELECT
          a.id, a.appointment_number, a.appointment_time,
          a.status, a.priority, a.appointment_type, a.chief_complaint,
          a.total_amount, a.payment_status,
          u.id as user_id, u.first_name as user_first_name, u.last_name as user_last_name, u.phone as user_phone,
          p.id as pet_id, p.name as pet_name,
          pt.name as pet_type,
          b.name as breed,
          c.name as clinic_name
        FROM vet_appointments a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
        LEFT JOIN breeds b ON p.breed_id = b.id
        LEFT JOIN vet_clinics c ON a.clinic_id = c.id
        WHERE a.veterinarian_id = $1
          AND a.appointment_date = CURRENT_DATE
          AND a.deleted_at IS NULL
        ORDER BY a.appointment_time ASC
      `, [vetId]),

      // Upcoming appointments (next 7 days)
      query(`
        SELECT
          a.id, a.appointment_number, a.appointment_date, a.appointment_time,
          a.status, a.priority, a.appointment_type, a.chief_complaint,
          u.first_name as user_first_name, u.last_name as user_last_name,
          p.id as pet_id, p.name as pet_name,
          pt.name as pet_type,
          c.name as clinic_name
        FROM vet_appointments a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
        LEFT JOIN vet_clinics c ON a.clinic_id = c.id
        WHERE a.veterinarian_id = $1
          AND a.appointment_date > CURRENT_DATE
          AND a.appointment_date <= CURRENT_DATE + INTERVAL '7 days'
          AND a.status IN ('scheduled', 'confirmed')
          AND a.deleted_at IS NULL
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
        LIMIT 10
      `, [vetId]),

      // Patient statistics
      query(`
        SELECT
          COUNT(DISTINCT a.pet_id) as total_patients,
          COUNT(DISTINCT a.user_id) as total_owners,
          COUNT(DISTINCT a.pet_id) FILTER (WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '30 days') as new_patients_this_month
        FROM vet_appointments a
        WHERE a.veterinarian_id = $1 AND a.deleted_at IS NULL
      `, [vetId]),

      // Earnings statistics
      query(`
        SELECT
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_earnings,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid' AND appointment_date = CURRENT_DATE), 0) as earnings_today,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid' AND appointment_date >= CURRENT_DATE - INTERVAL '7 days'), 0) as earnings_this_week,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid' AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as earnings_this_month,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'pending'), 0) as pending_earnings,
          COALESCE(AVG(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as avg_consultation_value
        FROM vet_appointments
        WHERE veterinarian_id = $1 AND deleted_at IS NULL
      `, [vetId]),

      // Review statistics
      query(`
        SELECT
          COUNT(*) as total_reviews,
          COALESCE(AVG(rating), 0) as avg_rating,
          COALESCE(AVG(professionalism_rating), 0) as avg_professionalism,
          COALESCE(AVG(knowledge_rating), 0) as avg_knowledge,
          COALESCE(AVG(communication_rating), 0) as avg_communication,
          COUNT(*) FILTER (WHERE rating >= 4) as positive_reviews,
          COUNT(*) FILTER (WHERE rating < 3) as negative_reviews
        FROM vet_reviews
        WHERE veterinarian_id = $1 AND status = 'approved' AND deleted_at IS NULL
      `, [vetId]),

      // Pending medical records (appointments completed but no records)
      query(`
        SELECT
          a.id, a.appointment_number, a.appointment_date, a.appointment_time,
          p.name as pet_name, pt.name as pet_type,
          u.first_name as user_first_name, u.last_name as user_last_name
        FROM vet_appointments a
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.veterinarian_id = $1
          AND a.status = 'completed'
          AND a.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM vet_medical_records mr
            WHERE mr.appointment_id = a.id AND mr.deleted_at IS NULL
          )
        ORDER BY a.appointment_date DESC
        LIMIT 5
      `, [vetId]),

      // Recent patients
      query(`
        SELECT DISTINCT ON (p.id)
          p.id as pet_id, p.name as pet_name,
          pt.name as pet_type, b.name as breed,
          u.first_name as owner_first_name, u.last_name as owner_last_name, u.phone as owner_phone,
          a.appointment_date as last_visit,
          a.chief_complaint as last_complaint
        FROM vet_appointments a
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
        LEFT JOIN breeds b ON p.breed_id = b.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE a.veterinarian_id = $1
          AND a.status = 'completed'
          AND a.deleted_at IS NULL
        ORDER BY p.id, a.appointment_date DESC
        LIMIT 10
      `, [vetId])
    ]);

    // Get appointment trends (last 7 days)
    const appointmentTrends = await query(`
      SELECT
        appointment_date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled' OR status = 'no_show') as missed,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as revenue
      FROM vet_appointments
      WHERE veterinarian_id = $1
        AND appointment_date >= CURRENT_DATE - INTERVAL '7 days'
        AND appointment_date <= CURRENT_DATE
        AND deleted_at IS NULL
      GROUP BY appointment_date
      ORDER BY appointment_date ASC
    `, [vetId]);

    // Get clinics this vet works at
    const clinics = await query(`
      SELECT
        c.id, c.name, c.slug, c.contact_number,
        vcm.is_primary, vcm.consultation_fee_override
      FROM vet_clinic_mappings vcm
      LEFT JOIN vet_clinics c ON vcm.clinic_id = c.id
      WHERE vcm.veterinarian_id = $1 AND vcm.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY vcm.is_primary DESC
    `, [vetId]);

    // Get recent reviews
    const recentReviews = await query(`
      SELECT
        r.id, r.rating, r.review_text, r.created_at,
        r.professionalism_rating, r.knowledge_rating, r.communication_rating, r.facility_rating,
        r.is_anonymous,
        CASE WHEN r.is_anonymous THEN NULL ELSE u.first_name END as owner_first_name,
        CASE WHEN r.is_anonymous THEN NULL ELSE u.last_name END as owner_last_name,
        p.name as pet_name,
        a.appointment_type
      FROM vet_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN vet_appointments a ON r.appointment_id = a.id
      LEFT JOIN pets p ON a.pet_id = p.id
      WHERE r.veterinarian_id = $1
        AND r.deleted_at IS NULL
        AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [vetId]);

    res.json(successResponse({
      profile: {
        id: vetProfile.id,
        license_number: vetProfile.license_number,
        specialization: vetProfile.specialization,
        consultation_fee: vetProfile.consultation_fee,
        rating: vetProfile.rating,
        total_appointments: vetProfile.total_appointments
      },
      appointments: {
        stats: appointmentStats.rows[0],
        today: todayAppointments.rows,
        upcoming: upcomingAppointments.rows,
        trends: appointmentTrends.rows
      },
      patients: {
        stats: patientStats.rows[0],
        recent: recentPatients.rows
      },
      earnings: earningsStats.rows[0],
      reviews: {
        ...reviewStats.rows[0],
        recent: recentReviews.rows
      },
      pending_records: pendingRecords.rows,
      clinics: clinics.rows
    }, 'Veterinarian dashboard summary retrieved successfully'));

  } catch (err) {
    console.error('Veterinarian dashboard summary error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch veterinarian dashboard summary' });
  }
};

// ============================================================================
// USER PROFILE (for dashboard) - returns authenticated user's profile (common fields: user, roles, addresses)
// ============================================================================
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const userResult = await query(
      `SELECT id, email, phone, first_name, last_name, display_name, avatar_url, bio, is_email_verified, status, last_login_at, created_at
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const user = userResult.rows[0];

    const rolesResult = await query(
      `SELECT r.id, r.name, r.slug, ur.is_primary
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [userId]
    );

    // Get user addresses
    const addressesResult = await query(
      `SELECT id, type, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary, created_at
       FROM user_addresses
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY is_primary DESC, created_at DESC`,
      [userId]
    );

    res.json(successResponse({
      user,
      roles: rolesResult.rows,
      addresses: addressesResult.rows
    }, 'User profile retrieved successfully'));

  } catch (err) {
    console.error('Get user profile error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user profile' });
  }
};

// PATCH /api/dashboard/profile - update authenticated user's basic profile fields
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const allowed = ['first_name','last_name','display_name','avatar_url','bio','phone'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates.push(`${field} = $${idx}`);
        params.push(req.body[field]);
        idx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No updatable fields provided' });
    }

    params.push(userId);

    const q = `UPDATE users SET ${updates.join(', ')}, updated_at = now() WHERE id = $${idx} AND deleted_at IS NULL RETURNING id, email, phone, first_name, last_name, display_name, avatar_url, bio, is_email_verified, status, last_login_at, created_at, updated_at`;

    const result = await query(q, params);

    if (!result.rows[0]) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Audit log if available
    if (typeof req.auditLog === 'function') {
      try { req.auditLog('update', 'user', { userId, changes: req.body }); } catch (e) { /* ignore audit errors */ }
    }

    res.json(successResponse(result.rows[0], 'Profile updated successfully'));
  } catch (err) {
    console.error('Update user profile error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
};

module.exports = {
  getAdminDashboardSummary,
  getOwnerDashboardSummary,
  getVeterinarianDashboardSummary,
  getUserProfile,
  updateUserProfile
};
