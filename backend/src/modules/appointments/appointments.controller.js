// src/modules/appointments/appointments.controller.js
// ============================================================================
// Veterinary Appointments Controller with Payment & Transaction Handling
// ============================================================================

const { query, getConnection, transaction } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');
//const logger = require('../../core/utils/logger');

// ==================ADMIN - APPOINTMENT LISTING & RETRIEVAL==========================
const listAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user_id, veterinarian_id, clinic_id, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let where = 'a.deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (status) {
      where += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (user_id) {
      where += ` AND a.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }
    if (veterinarian_id) {
      where += ` AND a.veterinarian_id = $${paramIndex}`;
      params.push(veterinarian_id);
      paramIndex++;
    }
    if (clinic_id) {
      where += ` AND a.clinic_id = $${paramIndex}`;
      params.push(clinic_id);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND a.appointment_date >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND a.appointment_date <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    // Add limit and offset to params for proper indexing
    params.push(parseInt(limit));
    params.push(parseInt(offset));
    const limitIndex = paramIndex;
    const offsetIndex = paramIndex + 1;

    const result = await query(
      `SELECT 
        a.id, a.appointment_number, a.appointment_date, a.appointment_time, 
        a.status, a.priority, a.appointment_type, a.chief_complaint, a.notes, a.symptoms,
        a.consultation_fee, a.service_fee, a.total_amount, a.payment_status,
        a.vet_service_ids,
        u.first_name, u.last_name, u.email,
        p.name as pet_name,
        vu.first_name as vet_first_name, vu.last_name as vet_last_name,
        c.name as clinic_name,
        jsonb_build_object(
          'id', pay.id,
          'payment_method', pay.payment_method,
          'total_amount', pay.total_amount,
          'paid_amount', pay.paid_amount,
          'payment_status', pay.payment_status
        ) as payment_info,
        (
          SELECT jsonb_agg(jsonb_build_object('id', vs.id, 'name', vs.name, 'code', vs.code, 'default_fee', vs.default_fee))
          FROM vet_services vs
          WHERE vs.deleted_at IS NULL AND vs.id = ANY(
            SELECT (jsonb_array_elements(a.vet_service_ids)->>'service_id')::uuid
          )
        ) as services
       FROM vet_appointments a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN pets p ON a.pet_id = p.id
       LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN vet_clinics c ON a.clinic_id = c.id
       LEFT JOIN vet_appointment_payments pay ON a.id = pay.appointment_id
       WHERE ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params
    );

    // For count query, use only filter params (not limit/offset)
    const countParams = params.slice(0, params.length - 2);
    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_appointments a WHERE ${where}`,
      countParams
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    console.error('List appointments error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch appointments' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, 
              u.email as user_email, u.phone as user_phone, u.first_name, u.last_name,
              p.name as pet_name, p.age as pet_age,
              vu.first_name as vet_first_name, vu.last_name as vet_last_name, v.specialization,
              c.name as clinic_name, c.contact_number as clinic_phone
       FROM vet_appointments a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN pets p ON a.pet_id = p.id
       LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN vet_clinics c ON a.clinic_id = c.id
       WHERE a.id = $1 AND a.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    // Fetch related payment info
    const paymentResult = await query(
      `SELECT * FROM vet_appointment_payments WHERE appointment_id = $1`,
      [req.params.id]
    );

    // Fetch services
    const servicesResult = await query(
      `SELECT vs.id, vs.code, vs.name, vs.default_fee, vs.default_duration_minutes
       FROM vet_services vs
       WHERE vs.id = ANY(
         SELECT (jsonb_array_elements(vet_service_ids)->>'service_id')::uuid
         FROM vet_appointments WHERE id = $1
       )`,
      [req.params.id]
    );

    // Fetch medical records for this appointment
    const medicalRecordsResult = await query(
      `SELECT id, record_type, record_date, diagnosis, followup_required, followup_date
       FROM vet_medical_records 
       WHERE appointment_id = $1 AND deleted_at IS NULL
       ORDER BY record_date DESC`,
      [req.params.id]
    );

    // Fetch prescriptions for this appointment
    const prescriptionsResult = await query(
      `SELECT id, prescription_number, prescription_date, valid_until, status
       FROM vet_prescriptions 
       WHERE appointment_id = $1 AND deleted_at IS NULL
       ORDER BY prescription_date DESC`,
      [req.params.id]
    );

    // Fetch lab tests for this appointment
    const labTestsResult = await query(
      `SELECT id, test_name, test_type, ordered_date, status, result_date
       FROM vet_lab_tests
       WHERE appointment_id = $1 AND deleted_at IS NULL
       ORDER BY ordered_date DESC`,
      [req.params.id]
    );

    // Fetch vaccinations for this appointment
    const vaccinationsResult = await query(
      `SELECT id, vaccine_name, vaccine_type, vaccination_date, next_due_date,
              manufacturer, batch_number, site_of_injection, adverse_reactions,
              certificate_issued, certificate_number, cost, notes
       FROM vet_vaccinations
       WHERE appointment_id = $1 AND deleted_at IS NULL
       ORDER BY vaccination_date DESC`,
      [req.params.id]
    );

    res.json(successResponse({
      ...appointment,
      payment: paymentResult.rows[0] || null,
      services: servicesResult.rows,
      medical_records: medicalRecordsResult.rows.length > 0 ? medicalRecordsResult.rows : [],
      prescriptions: prescriptionsResult.rows.length > 0 ? prescriptionsResult.rows : [],
      lab_tests: labTestsResult.rows.length > 0 ? labTestsResult.rows : [],
      vaccinations: vaccinationsResult.rows.length > 0 ? vaccinationsResult.rows : [],
      related_records_summary: {
        has_medical_records: medicalRecordsResult.rows.length > 0,
        has_prescriptions: prescriptionsResult.rows.length > 0,
        has_lab_tests: labTestsResult.rows.length > 0,
        has_vaccinations: vaccinationsResult.rows.length > 0,
        total_medical_records: medicalRecordsResult.rows.length,
        total_prescriptions: prescriptionsResult.rows.length,
        total_lab_tests: labTestsResult.rows.length,
        total_vaccinations: vaccinationsResult.rows.length
      }
    }));
  } catch (err) {
    //logger.error('Get appointment failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch appointment' });
  }
};

// ==================VETERINARIAN - APPOINTMENT LISTING & RETRIEVAL==========================
// Vet-specific: list appointments for the authenticated veterinarian with filter (today, past, upcoming, all)
const getVetAppointmentsByFilter = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const vetRes = await query('SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    if (vetRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Veterinarian profile not found' });
    }
    const vetId = vetRes.rows[0].id;

    const { filter = 'all', page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    // Validate filter
    if (!['today', 'past', 'upcoming', 'all'].includes(filter)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid filter. Allowed values: today, past, upcoming, all'
      });
    }

    let where = 'a.deleted_at IS NULL AND a.veterinarian_id = $1';
    const params = [vetId];
    let paramIndex = 2;

    // Apply date filters based on filter type
    if (filter === 'today') {
      where += ` AND a.appointment_date = CURRENT_DATE`;
    } else if (filter === 'past') {
      where += ` AND a.appointment_date < CURRENT_DATE`;
    } else if (filter === 'upcoming') {
      where += ` AND a.appointment_date > CURRENT_DATE`;
    }
    // 'all' has no additional date filter

    // Apply status filter if provided
    if (status) {
      where += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    params.push(parseInt(limit));
    params.push(parseInt(offset));
    const limitIndex = paramIndex;
    const offsetIndex = paramIndex + 1;

    const result = await query(
      `SELECT 
        a.id, a.appointment_number, a.appointment_date, a.appointment_time, 
        a.status, a.priority, a.appointment_type, a.chief_complaint, a.notes, a.symptoms,
        a.consultation_fee, a.service_fee, a.total_amount, a.payment_status,
        a.vet_service_ids,
        u.id as user_id, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
        p.id as pet_id, p.name as pet_name,
        pt.name as pet_type_name,
        b.name as breed_name,
        c.id as clinic_id, c.name as clinic_name, c.contact_number as clinic_phone,
        jsonb_build_object(
          'id', pay.id,
          'payment_method', pay.payment_method,
          'total_amount', pay.total_amount,
          'paid_amount', pay.paid_amount,
          'payment_status', pay.payment_status
        ) as payment_info,
        (
          SELECT jsonb_agg(jsonb_build_object('id', vs.id, 'name', vs.name, 'code', vs.code, 'default_fee', vs.default_fee))
          FROM vet_services vs
          WHERE vs.deleted_at IS NULL AND vs.id = ANY(
            SELECT (jsonb_array_elements(a.vet_service_ids)->>'service_id')::uuid
          )
        ) as services
       FROM vet_appointments a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN pets p ON a.pet_id = p.id
       LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
       LEFT JOIN breeds b ON p.breed_id = b.id
       LEFT JOIN vet_clinics c ON a.clinic_id = c.id
       LEFT JOIN vet_appointment_payments pay ON a.id = pay.appointment_id
       WHERE ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params
    );

    // Count query
    const countParams = [vetId];
    let countWhere = 'a.deleted_at IS NULL AND a.veterinarian_id = $1';
    
    if (filter === 'today') {
      countWhere += ` AND a.appointment_date = CURRENT_DATE`;
    } else if (filter === 'past') {
      countWhere += ` AND a.appointment_date < CURRENT_DATE`;
    } else if (filter === 'upcoming') {
      countWhere += ` AND a.appointment_date > CURRENT_DATE`;
    }

    if (status) {
      countWhere += ` AND a.status = $2`;
      countParams.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_appointments a WHERE ${countWhere}`,
      countParams
    );

    res.json(successResponse({
      data: result.rows,
      filter,
      status: status || 'all',
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    console.error('Get vet appointments by filter error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch appointments' });
  }
};

// Vet-specific: full detail but only if the veterinarian owns the appointment
const getVetAppointmentById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const vetRes = await query('SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    if (vetRes.rows.length === 0) return res.status(403).json({ status: 'error', message: 'Not a veterinarian' });
    const vetId = vetRes.rows[0].id;

    const appointmentId = req.params.id;
    const full = await query(
      `SELECT a.veterinarian_id FROM vet_appointments a WHERE a.id = $1 AND a.deleted_at IS NULL`,
      [appointmentId]
    );
    if (full.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    if (full.rows[0].veterinarian_id !== vetId) return res.status(403).json({ status: 'error', message: 'Access denied' });

    // Reuse getFullAppointment logic by calling the existing function via internal request
    return getFullAppointment(req, res);
  } catch (err) {
    console.error('Get vet appointment failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch appointment' });
  }
};


// ==================OWNER - APPOINTMENT LISTING & RETRIEVAL==========================
// Owner-specific: list appointments for the authenticated owner with filter (today, past, upcoming, all)
const getOwnerAppointmentsByFilter = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { filter = 'all', page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    // Validate filter
    if (!['today', 'past', 'upcoming', 'all'].includes(filter)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid filter. Allowed values: today, past, upcoming, all'
      });
    }

    let where = 'a.deleted_at IS NULL AND a.user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    // Apply date filters based on filter type
    if (filter === 'today') {
      where += ` AND a.appointment_date = CURRENT_DATE`;
    } else if (filter === 'past') {
      where += ` AND a.appointment_date < CURRENT_DATE`;
    } else if (filter === 'upcoming') {
      where += ` AND a.appointment_date > CURRENT_DATE`;
    }
    // 'all' has no additional date filter

    // Apply status filter if provided
    if (status) {
      where += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    params.push(parseInt(limit));
    params.push(parseInt(offset));
    const limitIndex = paramIndex;
    const offsetIndex = paramIndex + 1;

    const result = await query(
      `SELECT 
        a.id, a.appointment_number, a.appointment_date, a.appointment_time, 
        a.status, a.priority, a.appointment_type, a.chief_complaint, a.notes, a.symptoms,
        a.consultation_fee, a.service_fee, a.total_amount, a.payment_status,
        a.vet_service_ids,
        vu.id as vet_id, vu.first_name as vet_first_name, vu.last_name as vet_last_name,
        p.id as pet_id, p.name as pet_name,
        pt.name as pet_type_name,
        b.name as breed_name,
        c.id as clinic_id, c.name as clinic_name, c.contact_number as clinic_phone,
        jsonb_build_object(
          'id', pay.id,
          'payment_method', pay.payment_method,
          'total_amount', pay.total_amount,
          'paid_amount', pay.paid_amount,
          'payment_status', pay.payment_status
        ) as payment_info,
        (
          SELECT jsonb_agg(jsonb_build_object('id', vs.id, 'name', vs.name, 'code', vs.code, 'default_fee', vs.default_fee))
          FROM vet_services vs
          WHERE vs.deleted_at IS NULL AND vs.id = ANY(
            SELECT (jsonb_array_elements(a.vet_service_ids)->>'service_id')::uuid
          )
        ) as services
       FROM vet_appointments a
       LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN pets p ON a.pet_id = p.id
       LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
       LEFT JOIN breeds b ON p.breed_id = b.id
       LEFT JOIN vet_clinics c ON a.clinic_id = c.id
       LEFT JOIN vet_appointment_payments pay ON a.id = pay.appointment_id
       WHERE ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params
    );

    // Count query
    const countParams = [userId];
    let countWhere = 'a.deleted_at IS NULL AND a.user_id = $1';
    
    if (filter === 'today') {
      countWhere += ` AND a.appointment_date = CURRENT_DATE`;
    } else if (filter === 'past') {
      countWhere += ` AND a.appointment_date < CURRENT_DATE`;
    } else if (filter === 'upcoming') {
      countWhere += ` AND a.appointment_date > CURRENT_DATE`;
    }

    if (status) {
      countWhere += ` AND a.status = $2`;
      countParams.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_appointments a WHERE ${countWhere}`,
      countParams
    );

    res.json(successResponse({
      data: result.rows,
      filter,
      status: status || 'all',
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    console.error('Get owner appointments by filter error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch appointments' });
  }
};

// ======= APPOINTMENT CREATION & UPDATE========================================
const createAppointment = async (req, res) => {
  //const client = await query._pool.connect();
  const client = await getConnection();
  try {
    await client.query('BEGIN');

    const {
      user_id,
      pet_id,
      veterinarian_id,
      clinic_id,
      appointment_date,
      appointment_time,
      appointment_type = 'consultation',
      priority = 'normal',
      chief_complaint,
      symptoms,
      notes,
      service_ids = [],
      payment_info = {}
    } = req.body;

    // Validation
    if (!user_id || !pet_id || !veterinarian_id || !clinic_id || !appointment_date || !appointment_time) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [
          { param: 'user_id', msg: 'User ID is required' },
          { param: 'pet_id', msg: 'Pet ID is required' },
          { param: 'veterinarian_id', msg: 'Veterinarian ID is required' },
          { param: 'clinic_id', msg: 'Clinic ID is required' },
          { param: 'appointment_date', msg: 'Appointment date is required' },
          { param: 'appointment_time', msg: 'Appointment time is required' }
        ]
      });
    }

    // Check veterinarian availability
    const scheduleCheck = await client.query(
      `SELECT id FROM vet_schedules 
       WHERE veterinarian_id = $1 AND clinic_id = $2 
       AND day_of_week = EXTRACT(DOW FROM $3::date)::smallint
       AND is_available = true`,
      [veterinarian_id, clinic_id, appointment_date]
    );
    /*
    if (scheduleCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Veterinarian not available on this date'
      });
    }
    */
    // Check for schedule exceptions (leaves, holidays)
    const exceptionCheck = await client.query(
      `SELECT id FROM vet_schedule_exceptions 
       WHERE veterinarian_id = $1 AND exception_date = $2`,
      [veterinarian_id, appointment_date]
    );

    if (exceptionCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Veterinarian unavailable on this date (leave/holiday)'
      });
    }

    // Calculate fees from services
    let totalFees = 0;
    let serviceIds = [];
    const vets = await client.query(
      `SELECT consultation_fee FROM veterinarians WHERE id = $1`,
      [veterinarian_id]
    );
    const consultationFee = parseFloat(vets.rows[0]?.consultation_fee || 0);

    if (service_ids.length > 0) {
      const servicesResult = await client.query(
        `SELECT id, default_fee FROM vet_services WHERE id = ANY($1)`,
        [service_ids]
      );
      totalFees = servicesResult.rows.reduce((sum, s) => sum + parseFloat(s.default_fee || 0), 0);
      serviceIds = servicesResult.rows.map(s => ({ service_id: s.id, quantity: 1, unit_fee: parseFloat(s.default_fee) }));
    }

    const totalAmount = parseFloat((consultationFee + totalFees).toFixed(2));

    // Insert appointment - appointment_number generated by DB trigger
    const appointmentResult = await client.query(
      `INSERT INTO vet_appointments (
        user_id, pet_id, veterinarian_id, clinic_id, 
        appointment_date, appointment_time,
        appointment_type, priority, chief_complaint, symptoms, notes,
        consultation_fee, service_fee, total_amount,
        vet_service_ids, payment_status, status,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, appointment_number`,
      [
        user_id, pet_id, veterinarian_id, clinic_id,
        appointment_date, appointment_time,
        appointment_type, priority, chief_complaint,
        symptoms ? JSON.stringify(symptoms) : null,
        notes,
        consultationFee, totalFees, totalAmount,
        JSON.stringify(serviceIds), 'pending', 'scheduled',
        req.user?.id || null
      ]
    );

    const appointmentId = appointmentResult.rows[0].id;
    const appointmentNumber = appointmentResult.rows[0].appointment_number;

    let paymentRecord = null;

    // Handle payment if payment info provided
    if (payment_info && Object.keys(payment_info).length > 0) {
      const { payment_type, method, insurance_id, amount_to_pay, notes: paymentNotes } = payment_info;

      // Validate payment type
      if (!['online', 'cash', 'insurance'].includes(payment_type)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          status: 'error',
          message: 'Invalid payment type. Must be online, cash, or insurance'
        });
      }

      let paymentStatus = 'pending';
      let paidAmount = amount_to_pay ? parseFloat(amount_to_pay) : 0;
      const discountAmount = 0;
      const taxAmount = 0;
      const otherCharges = 0;

      // Determine initial payment status based on type
      if (payment_type === 'online' && method && amount_to_pay) {
        paymentStatus = 'pending'; // Will be updated after gateway response
      } else if (payment_type === 'cash') {
        paymentStatus = 'pending'; // Will be paid at clinic
      } else if (payment_type === 'insurance') {
        paymentStatus = 'pending'; // Will be processed through insurance
      }

      // Create payment record
      const paymentResult = await client.query(
        `INSERT INTO vet_appointment_payments (
          appointment_id, user_id, payment_method, 
          consultation_fee, other_charges, subtotal,
          discount_amount, tax_amount, total_amount, paid_amount, payment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, payment_status`,
        [
          appointmentId, user_id, payment_type,
          parseFloat(consultationFee), parseFloat(otherCharges), parseFloat(consultationFee + totalFees),
          parseFloat(discountAmount), parseFloat(taxAmount), parseFloat(totalAmount), parseFloat(paidAmount), paymentStatus
        ]
      );

      paymentRecord = {
        id: paymentResult.rows[0].id,
        payment_type,
        payment_status: paymentResult.rows[0].payment_status,
        total_amount: totalAmount
      };

      // Handle online payment transaction
      if (payment_type === 'online' && method) {
        const transactionResult = await client.query(
          `INSERT INTO vet_payment_transactions (
            payment_id, transaction_type, payment_method, amount, status
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, transaction_id`,
          [
            paymentResult.rows[0].id, 'user_payment', method,
            amount_to_pay || totalAmount, 'pending'
          ]
        );

        paymentRecord.transaction_id = transactionResult.rows[0].transaction_id;
      }
    }

    await client.query('COMMIT');

    //logger.info('Appointment created', { appointmentId, userId: user_id, appointmentNumber });

    res.status(201).json(successResponse({
      id: appointmentId,
      appointment_number: appointmentNumber,
      status: 'scheduled',
      total_amount: totalAmount,
      payment: paymentRecord,
      message: 'Appointment booked successfully'
    }, 'Appointment created', 201));

  } catch (err) {
    await client.query('ROLLBACK');
    //logger.error('Create appointment failed', { error: err.message, stack: err.stack });

    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({
      status: 'error',
      message: isProd ? 'Failed to create appointment' : `Failed to create appointment: ${err.message}`
    });
  } finally {
    client.release();
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
        errors: [{ param: 'status', msg: `Status must be one of: ${validStatuses.join(', ')}` }]
      });
    }

    // Fetch current appointment
    const appointmentResult = await query(
      `SELECT status, appointment_date, appointment_time FROM vet_appointments WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    const currentStatus = appointmentResult.rows[0].status;

    // Validate status transitions
    const validTransitions = {
      'scheduled': ['confirmed', 'cancelled', 'rescheduled'],
      'confirmed': ['in_progress', 'cancelled', 'rescheduled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'no_show': [],
      'rescheduled': ['scheduled', 'confirmed', 'cancelled']
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot transition from ${currentStatus} to ${status}`
      });
    }

    let updateFields = 'status = $2, updated_by = $3';
    const params = [id, status, req.user?.id || null];
    let paramIndex = 4;

    // Handle special status changes
    if (status === 'confirmed') {
      updateFields += `, checked_in_at = NULL`;
    } else if (status === 'in_progress') {
      updateFields += `, checked_in_at = now()`;
    } else if (status === 'completed') {
      updateFields += `, checked_out_at = now()`;
    } else if (status === 'cancelled') {
      updateFields += `, cancelled_at = now(), cancellation_reason = $${paramIndex}`;
      params.push(notes || null);
      paramIndex++;
    }

    const result = await query(
      `UPDATE vet_appointments
       SET ${updateFields}
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, appointment_number, status, appointment_date, appointment_time`,
      params
    );

    //logger.info('Appointment status updated', { appointmentId: id, oldStatus: currentStatus, newStatus: status, userId: req.user?.id });

    res.json(successResponse(result.rows[0], 'Appointment status updated'));
  } catch (err) {
    //logger.error('Update appointment status failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to update appointment status' });
  }
};

// ============================================================================
// PAYMENT HANDLING
// ============================================================================

const processPayment = async (req, res) => {
  //const client = await query._pool.connect();
  const client = await getConnection();
  try {
    await client.query('BEGIN');

    const { appointmentId } = req.params;
    const { payment_type, method, amount, transaction_id, insurance_id, status: txnStatus } = req.body;

    // Validate payment type
    if (!['online', 'cash', 'insurance'].includes(payment_type)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment type'
      });
    }

    // Fetch appointment
    const appointmentResult = await client.query(
      `SELECT id, total_amount, payment_status FROM vet_appointments WHERE id = $1 AND deleted_at IS NULL`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    const appointment = appointmentResult.rows[0];

    // Fetch or create payment record
    let paymentResult = await client.query(
      `SELECT id, total_amount, paid_amount FROM vet_appointment_payments WHERE appointment_id = $1`,
      [appointmentId]
    );

    let paymentId;
    if (paymentResult.rows.length === 0) {
      const newPayment = await client.query(
        `INSERT INTO vet_appointment_payments (appointment_id, user_id, payment_method, total_amount, paid_amount, payment_status)
         SELECT id, user_id, $2, total_amount, 0, 'pending' FROM vet_appointments WHERE id = $1
         RETURNING id`,
        [appointmentId, payment_type]
      );
      paymentId = newPayment.rows[0].id;
    } else {
      paymentId = paymentResult.rows[0].id;
    }

    // Create transaction record
    const txnResult = await client.query(
      `INSERT INTO vet_payment_transactions (
        payment_id, transaction_type, payment_method, amount, status, transaction_date
      )
      VALUES ($1, $2, $3, $4, $5, now())
      RETURNING id, status`,
      [paymentId, 'user_payment', method || payment_type, amount || appointment.total_amount, txnStatus || 'pending']
    );

    // Update payment status based on transaction
    let newPaymentStatus = 'pending';
    if (txnStatus === 'completed') {
      newPaymentStatus = 'paid';
    } else if (txnStatus === 'failed') {
      newPaymentStatus = 'failed';
    }

    await client.query(
      `UPDATE vet_appointment_payments SET payment_status = $2 WHERE id = $1`,
      [paymentId, newPaymentStatus]
    );

    // Update appointment payment status
    await client.query(
      `UPDATE vet_appointments SET payment_status = $2 WHERE id = $1`,
      [appointmentId, newPaymentStatus]
    );

    await client.query('COMMIT');

    //logger.info('Payment processed', { appointmentId, paymentType: payment_type, status: newPaymentStatus });

    res.json(successResponse({
      appointment_id: appointmentId,
      payment_id: paymentId,
      transaction_id: txnResult.rows[0].id,
      payment_status: newPaymentStatus,
      amount: amount || appointment.total_amount
    }, 'Payment processed successfully'));

  } catch (err) {
    await client.query('ROLLBACK');
    //logger.error('Process payment failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to process payment' });
  } finally {
    client.release();
  }
};

const getPaymentInfo = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const paymentResult = await query(
      `SELECT * FROM vet_appointment_payments WHERE appointment_id = $1`,
      [appointmentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Payment record not found' });
    }

    const transactionsResult = await query(
      `SELECT id, transaction_type, payment_method, amount, status, transaction_date
       FROM vet_payment_transactions
       WHERE payment_id = $1
       ORDER BY transaction_date DESC`,
      [paymentResult.rows[0].id]
    );

    res.json(successResponse({
      payment: paymentResult.rows[0],
      transactions: transactionsResult.rows
    }));
  } catch (err) {
    //logger.error('Get payment info failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch payment info' });
  }
};

// ============================================================================
// APPOINTMENT RESCHEDULING
// ============================================================================

const rescheduleAppointment = async (req, res) => {
  //const client = await query._pool.connect();
  const client = await getConnection();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { new_date, new_time, reason } = req.body;

    // Fetch current appointment
    const appointmentResult = await client.query(
      `SELECT appointment_date, appointment_time, veterinarian_id, clinic_id, status
       FROM vet_appointments WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (appointmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    const current = appointmentResult.rows[0];

    if (!['scheduled', 'confirmed'].includes(current.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Can only reschedule scheduled or confirmed appointments'
      });
    }

    // Verify new slot availability
    const scheduleCheck = await client.query(
      `SELECT id FROM vet_schedules 
       WHERE veterinarian_id = $1 AND clinic_id = $2 
       AND day_of_week = EXTRACT(DOW FROM $3::date)::smallint
       AND is_available = true`,
      [current.veterinarian_id, current.clinic_id, new_date]
    );

    if (scheduleCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Veterinarian not available on new date'
      });
    }

    // Record reschedule history
    await client.query(
      `INSERT INTO vet_appointment_reschedules (
        appointment_id, old_date, old_time, new_date, new_time, reason, rescheduled_by, rescheduled_by_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, current.appointment_date, current.appointment_time, new_date, new_time, reason || null, 'user', req.user?.id || null]
    );

    // Update appointment
    const updateResult = await client.query(
      `UPDATE vet_appointments
       SET appointment_date = $2, appointment_time = $3, status = 'scheduled'
       WHERE id = $1
       RETURNING id, appointment_number, appointment_date, appointment_time`,
      [id, new_date, new_time]
    );

    await client.query('COMMIT');

    //logger.info('Appointment rescheduled', { appointmentId: id, oldDate: current.appointment_date, newDate: new_date });

    res.json(successResponse(updateResult.rows[0], 'Appointment rescheduled successfully'));

  } catch (err) {
    await client.query('ROLLBACK');
    //logger.error('Reschedule appointment failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to reschedule appointment' });
  } finally {
    client.release();
  }
};

// ======= PET-SPECIFIC APPOINTMENTS=====================================
// Get pet profile with all appointment details - for veterinarian view
const getPetWithAppointments = async (req, res) => {
  try {
    const { pet_id } = req.params;

    // Fetch pet information with owner details
    const petResult = await query(
      `SELECT 
        p.id, p.name, p.slug, p.gender, p.size, p.date_of_birth, p.age, 
        p.weight, p.height, p.weight_unit, p.height_unit, p.additional_info,
        p.created_at, p.updated_at,
        pt.id as pet_type_id, pt.name as pet_type_name,
        b.id as breed_id, b.name as breed_name,
        u.id as owner_id, u.first_name as owner_first_name, u.last_name as owner_last_name, 
        u.email as owner_email, u.phone as owner_phone, u.avatar_url as owner_avatar
       FROM pets p
       LEFT JOIN pet_types pt ON p.pet_type_id = pt.id
       LEFT JOIN breeds b ON p.breed_id = b.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [pet_id]
    );

    if (petResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Pet not found' });
    }

    const pet = petResult.rows[0];

    // Fetch all appointments for this pet with complete details
    const appointmentsResult = await query(
      `SELECT 
        a.id, a.appointment_number, a.appointment_date, a.appointment_time, 
        a.status, a.priority, a.appointment_type, a.chief_complaint, a.notes, a.symptoms,
        a.consultation_fee, a.service_fee, a.total_amount, a.payment_status,
        a.vet_service_ids, a.created_at, a.updated_at,
        vu.id as vet_id, vu.first_name as vet_first_name, vu.last_name as vet_last_name, vu.email as vet_email,
        v.specialization,
        c.id as clinic_id, c.name as clinic_name, c.contact_number as clinic_phone,
        jsonb_build_object(
          'id', pay.id,
          'payment_method', pay.payment_method,
          'total_amount', pay.total_amount,
          'paid_amount', pay.paid_amount,
          'payment_status', pay.payment_status
        ) as payment_info,
        (
          SELECT jsonb_agg(jsonb_build_object('id', vs.id, 'name', vs.name, 'code', vs.code, 'default_fee', vs.default_fee))
          FROM vet_services vs
          WHERE vs.deleted_at IS NULL AND vs.id = ANY(
            SELECT (jsonb_array_elements(a.vet_service_ids)->>'service_id')::uuid
          )
        ) as services
       FROM vet_appointments a
       LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN vet_clinics c ON a.clinic_id = c.id
       LEFT JOIN vet_appointment_payments pay ON a.id = pay.appointment_id
       WHERE a.pet_id = $1 AND a.deleted_at IS NULL
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [pet_id]
    );

    // Fetch medical records for this pet
    const medicalRecordsResult = await query(
      `SELECT id, record_type, record_date, diagnosis, symptoms, vital_signs, 
              physical_examination, treatment_plan, recommendations, 
              followup_required, followup_date, notes
       FROM vet_medical_records 
       WHERE pet_id = $1 AND deleted_at IS NULL
       ORDER BY record_date DESC`,
      [pet_id]
    );

    // Fetch vaccinations for this pet
    const vaccinationsResult = await query(
      `SELECT id, vaccine_name, vaccine_type, vaccination_date, next_due_date,
              manufacturer, batch_number, site_of_injection, certificate_issued, 
              certificate_number, cost, notes
       FROM vet_vaccinations
       WHERE pet_id = $1 AND deleted_at IS NULL
       ORDER BY vaccination_date DESC`,
      [pet_id]
    );

    res.json(successResponse({
      pet,
      owner: {
        id: pet.owner_id,
        first_name: pet.owner_first_name,
        last_name: pet.owner_last_name,
        email: pet.owner_email,
        phone: pet.owner_phone,
        avatar_url: pet.owner_avatar
      },
      appointments: appointmentsResult.rows,
      medical_records: medicalRecordsResult.rows,
      vaccinations: vaccinationsResult.rows,
      stats: {
        total_appointments: appointmentsResult.rows.length,
        total_medical_records: medicalRecordsResult.rows.length,
        total_vaccinations: vaccinationsResult.rows.length
      }
    }));
  } catch (err) {
    console.error('Get pet with appointments error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch pet information' });
  }
};

// List appointments for a specific pet
const getPetAppointments = async (req, res) => {
  try {
    const { pet_id } = req.params;
    const { page = 1, limit = 10, status, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let where = 'a.deleted_at IS NULL AND a.pet_id = $1';
    const params = [pet_id];
    let paramIndex = 2;

    if (status) {
      where += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND a.appointment_date >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND a.appointment_date <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    params.push(parseInt(limit));
    params.push(parseInt(offset));
    const limitIndex = paramIndex;
    const offsetIndex = paramIndex + 1;

    const result = await query(
      `SELECT 
        a.id, a.appointment_number, a.appointment_date, a.appointment_time, 
        a.status, a.priority, a.appointment_type, a.chief_complaint, a.notes,
        a.consultation_fee, a.total_amount, a.payment_status,
        u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
        vu.first_name as vet_first_name, vu.last_name as vet_last_name,
        c.name as clinic_name
       FROM vet_appointments a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN vet_clinics c ON a.clinic_id = c.id
       WHERE ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params
    );

    const countParams = params.slice(0, params.length - 2);
    const countResult = await query(
      `SELECT COUNT(*) as total FROM vet_appointments a WHERE ${where}`,
      countParams
    );

    res.json(successResponse({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total)
    }));
  } catch (err) {
    console.error('Get pet appointments error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch pet appointments' });
  }
};

// Get all medical data (records, prescriptions, labs, vaccinations) for an appointment
const getAppointmentMedicalData = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Fetch appointment details
    const appointmentResult = await query(
      `SELECT id, pet_id, veterinarian_id FROM vet_appointments WHERE id = $1 AND deleted_at IS NULL`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    const appointment = appointmentResult.rows[0];

    // Fetch medical records for this appointment
    const medicalRecordsResult = await query(
      `SELECT id, record_type, record_date, diagnosis, symptoms, vital_signs, 
              physical_examination, treatment_plan, recommendations, 
              followup_required, followup_date, notes
       FROM vet_medical_records 
       WHERE appointment_id = $1 AND deleted_at IS NULL`,
      [appointmentId]
    );

    // Fetch prescriptions for this appointment
    const prescriptionsResult = await query(
      `SELECT vp.id, vp.prescription_number, vp.prescription_date, vp.valid_until, vp.status, vp.notes,
              jsonb_agg(jsonb_build_object(
                'id', vpm.id, 'medication_name', vpm.medication_name, 'dosage', vpm.dosage,
                'frequency', vpm.frequency, 'duration', vpm.duration, 'route', vpm.route,
                'instructions', vpm.instructions, 'quantity', vpm.quantity, 'refills_allowed', vpm.refills_allowed
              )) as medications
       FROM vet_prescriptions vp
       LEFT JOIN vet_prescription_medications vpm ON vp.id = vpm.prescription_id
       WHERE vp.appointment_id = $1 AND vp.deleted_at IS NULL
       GROUP BY vp.id, vp.prescription_number, vp.prescription_date, vp.valid_until, vp.status, vp.notes`,
      [appointmentId]
    );

    // Fetch lab tests for this appointment
    const labTestsResult = await query(
      `SELECT id, test_name, test_type, ordered_date, result_date, status, urgency,
              normal_range, results, interpretation, lab_name, cost
       FROM vet_lab_tests
       WHERE appointment_id = $1 AND deleted_at IS NULL
       ORDER BY ordered_date DESC`,
      [appointmentId]
    );

    // Fetch vaccinations for this appointment
    const vaccinationsResult = await query(
      `SELECT id, vaccine_name, vaccine_type, vaccination_date, next_due_date,
              manufacturer, batch_number, site_of_injection, adverse_reactions,
              certificate_issued, certificate_number, cost, notes
       FROM vet_vaccinations
       WHERE appointment_id = $1 AND deleted_at IS NULL
       ORDER BY vaccination_date DESC`,
      [appointmentId]
    );

    res.json(successResponse({
      appointment_id: appointmentId,
      pet_id: appointment.pet_id,
      veterinarian_id: appointment.veterinarian_id,
      medical_records: medicalRecordsResult.rows,
      prescriptions: prescriptionsResult.rows,
      lab_tests: labTestsResult.rows,
      vaccinations: vaccinationsResult.rows
    }));
  } catch (err) {
    console.error('Get appointment medical data error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch appointment medical data' });
  }
};


// One-shot full appointment detail with related data (single DB query with JOINs & subqueries)
const getFullAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.*, 
              u.id as user_id, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email, u.phone as user_phone,
              p.id as pet_id, p.name as pet_name, p.age as pet_age, p.species as pet_species,
              v.id as vet_id, vu.id as vet_user_id, vu.first_name as vet_first_name, vu.last_name as vet_last_name, v.specialization as vet_specialization,
              c.id as clinic_id, c.name as clinic_name, c.contact_number as clinic_phone,
              -- aggregate services for appointment
              (
                SELECT COALESCE(jsonb_agg(jsonb_build_object('id', vs.id, 'name', vs.name, 'code', vs.code, 'default_fee', vs.default_fee)), '[]'::jsonb)
                FROM vet_services vs
                WHERE vs.deleted_at IS NULL AND vs.id = ANY(
                  SELECT (jsonb_array_elements(a.vet_service_ids)->>'service_id')::uuid
                )
              ) as services,
              -- payments
              (
                SELECT COALESCE(jsonb_agg(jsonb_build_object('id', pay.id, 'payment_method', pay.payment_method, 'total_amount', pay.total_amount, 'paid_amount', pay.paid_amount, 'payment_status', pay.payment_status, 'transaction_id', pay.transaction_id)), '[]'::jsonb)
                FROM vet_appointment_payments pay
                WHERE pay.appointment_id = a.id
              ) as payments,
              -- medical records
              (
                SELECT COALESCE(jsonb_agg(row_to_json(m)), '[]'::jsonb)
                FROM (
                  SELECT id, record_date, record_type, diagnosis, symptoms, treatment_plan, followup_required, followup_date, notes
                  FROM vet_medical_records WHERE appointment_id = a.id
                ) m
              ) as medical_records,
              -- prescriptions
              (
                SELECT COALESCE(jsonb_agg(row_to_json(pr)), '[]'::jsonb)
                FROM (
                  SELECT id, prescription_number, prescription_date, valid_until, status, notes
                  FROM vet_prescriptions WHERE appointment_id = a.id
                ) pr
              ) as prescriptions,
              -- lab tests
              (
                SELECT COALESCE(jsonb_agg(row_to_json(lt)), '[]'::jsonb)
                FROM (
                  SELECT id, test_name, test_type, ordered_date, status, result_date, results
                  FROM vet_lab_tests WHERE appointment_id = a.id
                ) lt
              ) as lab_tests,
              -- vaccinations
              (
                SELECT COALESCE(jsonb_agg(row_to_json(vac)), '[]'::jsonb)
                FROM (
                  SELECT id, vaccine_name, vaccination_date, next_due_date, certificate_issued
                  FROM vet_vaccinations WHERE appointment_id = a.id
                ) vac
              ) as vaccinations
       FROM vet_appointments a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN pets p ON a.pet_id = p.id
       LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
       LEFT JOIN users vu ON v.user_id = vu.id
       LEFT JOIN vet_clinics c ON a.clinic_id = c.id
       WHERE a.id = $1 AND a.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    res.json(successResponse(result.rows[0]));
  } catch (err) {
    console.error('Get full appointment failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch appointment' });
  }
};



module.exports = {
  listAppointments,
  getAppointmentById,
  getFullAppointment,
  getOwnerAppointmentsByFilter,
  getVetAppointmentsByFilter,
  getVetAppointmentById,
  getPetWithAppointments,
  getPetAppointments,
  getAppointmentMedicalData,
  createAppointment,
  updateAppointmentStatus,
  processPayment,
  getPaymentInfo,
  rescheduleAppointment
};