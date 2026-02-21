// src/modules/veterinarians/veterinarians.controller.js - CONTROLLER
// ============================================================

const { query, transaction } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');
const { hashPassword } = require('../../core/auth/password.service');
// const logger = require('../../core/utils/logger');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 100, clinic_id } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['v.deleted_at IS NULL'];
    const params = [limit, offset];

    if (clinic_id) {
      params.push(clinic_id);
      conditions.push(
        `EXISTS (
          SELECT 1 FROM vet_clinic_mappings vcm
          WHERE vcm.veterinarian_id = v.id
            AND vcm.clinic_id = $${params.length}
            AND vcm.deleted_at IS NULL
        )`
      );
    }

    const result = await query(
      `SELECT v.id, v.user_id, v.employee_id, v.license_number, v.specialization, v.experience_years, 
              v.consultation_fee, v.emergency_fee, v.bio, v.avatar_url, v.status, v.is_available_for_emergency,
              v.rating, v.total_appointments, v.created_at,
              u.first_name, u.last_name, u.email, u.phone,
              COALESCE(mappings.mappings, '[]'::jsonb) AS clinic_mappings
       FROM veterinarians v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT jsonb_agg(jsonb_build_object(
                  'clinic', jsonb_build_object('id', c.id, 'name', c.name),
                  'service_ids', COALESCE(m.service_ids, '[]'::jsonb),
                  'services', COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'code', s.code))
                    FROM vet_services s
                    WHERE s.id = ANY(SELECT (jsonb_array_elements_text(m.service_ids))::uuid)
                  ), '[]'::jsonb)
                )) AS mappings
         FROM vet_clinic_mappings m
         JOIN vet_clinics c ON c.id = m.clinic_id AND c.deleted_at IS NULL
         WHERE m.veterinarian_id = v.id AND m.deleted_at IS NULL
       ) mappings ON true
       WHERE ${conditions.join(' AND ')}
       ORDER BY v.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    res.json(successResponse({ data: result.rows, page: parseInt(page), limit: parseInt(limit) }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT v.*, u.first_name, u.last_name, u.email, u.phone, u.display_name, u.avatar_url as user_avatar_url,
              COALESCE(mappings.mappings, '[]'::jsonb) AS clinic_mappings
       FROM veterinarians v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT jsonb_agg(jsonb_build_object(
                  'clinic', jsonb_build_object('id', c.id, 'name', c.name),
                  'service_ids', COALESCE(m.service_ids, '[]'::jsonb),
                  'services', COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'code', s.code))
                    FROM vet_services s
                    WHERE s.id = ANY(SELECT (jsonb_array_elements_text(m.service_ids))::uuid)
                  ), '[]'::jsonb)
                )) AS mappings
         FROM vet_clinic_mappings m
         JOIN vet_clinics c ON c.id = m.clinic_id AND c.deleted_at IS NULL
         WHERE m.veterinarian_id = v.id AND m.deleted_at IS NULL
       ) mappings ON true
       WHERE v.id = $1 AND v.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(result.rows[0]));
  } catch (err) {
    // logger.error('Get veterinarian failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const create = async (req, res) => {
  try {
    const {
      employee_id,
      first_name,
      last_name,
      email,
      password,
      mobile,
      license_number,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      emergency_fee,
      bio,
      avatar_url,
      status,
      is_available_for_emergency
    } = req.body;

    if (!first_name || !String(first_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'first_name', msg: 'First name is required' }]
      });
    }

    if (!last_name || !String(last_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'last_name', msg: 'Last name is required' }]
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'email', msg: 'Email is required' }]
      });
    }

    if (!license_number || !String(license_number).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'license_number', msg: 'License number is required' }]
      });
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ param: 'password', msg: 'Password is required for veterinarian login' }]
      });
    }

    // Support simplified payload from frontend: a single `vet_clinic_id` and multiple `vet_service_id{1,2,3}` or `vet_service_ids` array.
    // For backward compatibility we still accept `clinic_services` or the previous `clinic_ids`+`service_ids` shapes.
    let { clinic_services, clinic_ids, service_ids, vet_clinic_id, vet_vlinic_id, vet_service_ids, vet_service_id1, vet_service_id2, vet_service_id3 } = req.body;

    clinic_services = Array.isArray(clinic_services) ? clinic_services : [];
    clinic_ids = Array.isArray(clinic_ids) ? clinic_ids : [];
    service_ids = Array.isArray(service_ids) ? service_ids : [];
    vet_service_ids = Array.isArray(vet_service_ids) ? vet_service_ids : [];

    const singleVetClinicId = vet_clinic_id || vet_vlinic_id || null;
    // collect individual service_id1..3 into vet_service_ids
    if (vet_service_id1) vet_service_ids.push(vet_service_id1);
    if (vet_service_id2) vet_service_ids.push(vet_service_id2);
    if (vet_service_id3) vet_service_ids.push(vet_service_id3);

    // Mapping info is optional now; if provided we'll validate and persist. No longer require mappings at create time.

    const vet = await transaction(async (client) => {
      // Check if email already exists in users table
      const existingUser = await client.query('SELECT id FROM users WHERE lower(email) = lower($1)', [email]);
      if (existingUser.rows.length > 0) {
        throw new Error('email_already_exists');
      }

      // Hash password for user account
      const password_hash = await hashPassword(password);

      // Create user account
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, display_name, status, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [email, password_hash, first_name, last_name, `${first_name} ${last_name}`, 'active', false]
      );

      const userId = userResult.rows[0].id;

      // Assign veterinarian role to user
      const roleResult = await client.query('SELECT id FROM roles WHERE slug = $1', ['veterinarian']);
      if (roleResult.rows.length > 0) {
        await client.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [userId, roleResult.rows[0].id]
        );
      }

      // Validate referenced clinics and services (if provided) per simplified workflow.
      const clinicIdsFromIds = Array.isArray(clinic_ids) ? clinic_ids.filter(Boolean) : [];
      const clinicIdsFromServices = Array.isArray(clinic_services) ? clinic_services.map(s => s && s.clinic_id).filter(Boolean) : [];
      const explicitClinicIds = singleVetClinicId ? [singleVetClinicId] : [];
      const allClinicIds = Array.from(new Set([...clinicIdsFromIds, ...clinicIdsFromServices, ...explicitClinicIds]));

      if (allClinicIds.length > 0) {
        const clinicsRes = await client.query(`SELECT id FROM vet_clinics WHERE id = ANY($1) AND deleted_at IS NULL`, [allClinicIds]);
        const found = clinicsRes.rows.map(r => r.id);
        const missing = allClinicIds.filter(id => !found.includes(id));
        if (missing.length > 0) {
          throw new Error('clinics_missing:' + missing.join(','));
        }
      }

      const serviceIdsFromIds = Array.isArray(service_ids) ? service_ids.filter(Boolean) : [];
      const serviceIdsFromServices = Array.isArray(clinic_services) ? clinic_services.map(s => s && s.service_id).filter(Boolean) : [];
      const serviceIdsFromSimple = Array.isArray(vet_service_ids) ? vet_service_ids.filter(Boolean) : [];
      const allServiceIds = Array.from(new Set([...serviceIdsFromIds, ...serviceIdsFromServices, ...serviceIdsFromSimple]));

      if (allServiceIds.length > 0) {
        const servicesRes = await client.query(`SELECT id FROM vet_services WHERE id = ANY($1) AND deleted_at IS NULL`, [allServiceIds]);
        const foundSvc = servicesRes.rows.map(r => r.id);
        const missingSvc = allServiceIds.filter(id => !foundSvc.includes(id));
        if (missingSvc.length > 0) {
          throw new Error('services_missing:' + missingSvc.join(','));
        }
      }

      const insertVet = await client.query(
        `INSERT INTO veterinarians (user_id, employee_id, license_number, specialization, qualification, experience_years, consultation_fee, emergency_fee, bio, avatar_url, status, is_available_for_emergency, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING id, created_at`,
        [
          userId,
          employee_id || null,
          license_number,
          specialization || null,
          qualification || null,
          experience_years || 0,
          consultation_fee || 0,
          emergency_fee || 0,
          bio || null,
          avatar_url || null,
          status === undefined ? 1 : status,
          is_available_for_emergency === undefined ? false : is_available_for_emergency,
          (req.user && req.user.id) || null
        ]
      );

      const vetId = insertVet.rows[0].id;

      // Keep track of clinics we've created mappings for
      const createdClinicIds = new Set();

      // Map of clinic_id => Set(service_id) for collecting services per clinic
      const servicesPerClinic = new Map();

      // Accept `clinic_ids` only as context for `service_ids` — do NOT create separate clinic mapping rows.
      if (Array.isArray(clinic_ids) && clinic_ids.length > 0) {
        for (const clinic_id of clinic_ids) {
          if (!clinic_id) continue;
          createdClinicIds.add(clinic_id);
        }
      }



      // insert clinic services if provided with clinic context
      if (Array.isArray(clinic_services) && clinic_services.length > 0) {
        for (const s of clinic_services) {
          const { clinic_id, service_id } = s;
          if (!clinic_id || !service_id) continue;
          if (!servicesPerClinic.has(clinic_id)) servicesPerClinic.set(clinic_id, new Set());
          servicesPerClinic.get(clinic_id).add(service_id);
          createdClinicIds.add(clinic_id);
        }
      }

      // Upsert vet_clinic_mappings for clinics described in clinic_services
      for (const [clinicId, svcSet] of servicesPerClinic.entries()) {
        const svcArray = Array.from(svcSet);
        await client.query(
          `INSERT INTO vet_clinic_mappings (veterinarian_id, clinic_id, is_primary, consultation_fee_override, service_ids, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5, now(), now())
           ON CONFLICT (veterinarian_id, clinic_id) DO UPDATE
           SET service_ids = COALESCE(EXCLUDED.service_ids, vet_clinic_mappings.service_ids),
               updated_at = now()`,
          [vetId, clinicId, false, null, JSON.stringify(svcArray)]
        );
      }

      // insert service_ids when simple list is provided. Must determine a single target clinic (either provided via `clinic_ids` or implied by a single clinic in `clinic_services`).
      // Handle simplified single-clinic service list (legacy `service_ids` or new `vet_service_ids` shape)
      const simpleServiceIds = (Array.isArray(vet_service_ids) && vet_service_ids.length > 0) ? vet_service_ids : (Array.isArray(service_ids) ? service_ids : []);
      if (simpleServiceIds.length > 0) {
        // Determine clinic context: prefer explicit single vet_clinic_id, then single clinic in clinic_ids, then single clinic implied in clinic_services.
        let targetClinicId = null;
        if (singleVetClinicId) {
          targetClinicId = singleVetClinicId;
        } else if (Array.isArray(clinic_ids) && clinic_ids.length === 1) {
          targetClinicId = clinic_ids[0];
        } else {
          const clinicsFromServices = Array.from(servicesPerClinic.keys());
          if (clinicsFromServices.length === 1) targetClinicId = clinicsFromServices[0];
        }

        if (!targetClinicId) {
          if ((clinic_ids || []).length === 0 && (clinic_services || []).length === 0 && !singleVetClinicId) {
            throw new Error('service_without_clinic');
          }
          throw new Error('service_ambiguous_clinic');
        }

        // Upsert mapping for the target clinic with the provided service ids
        await client.query(
          `INSERT INTO vet_clinic_mappings (veterinarian_id, clinic_id, is_primary, consultation_fee_override, service_ids, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5, now(), now())
           ON CONFLICT (veterinarian_id, clinic_id) DO UPDATE
           SET service_ids = COALESCE(EXCLUDED.service_ids, vet_clinic_mappings.service_ids),
               updated_at = now()`,
          [vetId, targetClinicId, true, null, JSON.stringify(simpleServiceIds)]
        );
      }

      return insertVet.rows[0];
    });

    res.status(201).json(successResponse(vet, 'Created', 201));
  } catch (err) {
    // logger.error('Create veterinarian failed', { error: err.message });
    if (err.message === 'email_already_exists') {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }

    if (err.message === 'service_without_clinic') {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'vet_service_ids', msg: 'Services require a clinic context (provide `vet_clinic_id` or `clinic_services` with clinic_id).' }] });
    }
    if (err.message === 'service_ambiguous_clinic') {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'vet_service_ids', msg: 'Ambiguous clinic context: provide a single clinic (`vet_clinic_id`) or use `clinic_services` to assign services per clinic.' }] });
    }

    if (err.message && err.message.startsWith('clinics_missing:')) {
      const ids = err.message.split(':')[1].split(',');
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'clinic_ids', msg: `Clinics not found: ${ids.join(',')}` }] });
    }

    if (err.message && err.message.startsWith('services_missing:')) {
      const ids = err.message.split(':')[1].split(',');
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'service_ids', msg: `Services not found: ${ids.join(',')}` }] });
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({ status: 'error', message: isProd ? 'Failed to create' : `Failed to create: ${err.message}` });
  }
};

const update = async (req, res) => {
  try {
    const {
      employee_id,
      first_name,
      last_name,
      email,
      mobile,
      license_number,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      emergency_fee,
      bio,
      avatar_url,
      status,
      is_available_for_emergency
    } = req.body;

    // Accept both detailed and simplified shapes
    let { clinic_mappings, clinic_services, clinic_ids, service_ids, vet_clinic_id, vet_vlinic_id, vet_service_ids, vet_service_id1, vet_service_id2, vet_service_id3 } = req.body;
    clinic_mappings = Array.isArray(clinic_mappings) ? clinic_mappings : [];
    clinic_services = Array.isArray(clinic_services) ? clinic_services : [];
    clinic_ids = Array.isArray(clinic_ids) ? clinic_ids : [];
    service_ids = Array.isArray(service_ids) ? service_ids : [];
    vet_service_ids = Array.isArray(vet_service_ids) ? vet_service_ids : [];
    const singleVetClinicId = vet_clinic_id || vet_vlinic_id || null;
    if (vet_service_id1) vet_service_ids.push(vet_service_id1);
    if (vet_service_id2) vet_service_ids.push(vet_service_id2);
    if (vet_service_id3) vet_service_ids.push(vet_service_id3);

    const updated = await transaction(async (client) => {
      // Get veterinarian to find associated user
      const vetResult = await client.query('SELECT user_id FROM veterinarians WHERE id = $1 AND deleted_at IS NULL', [req.params.id]);
      if (vetResult.rows.length === 0) throw new Error('not_found');
      
      const userId = vetResult.rows[0].user_id;

      // Update user profile if personal info provided
      if (first_name || last_name || email || mobile) {
        const updateUserFields = [];
        const updateUserValues = [];
        let paramIndex = 1;

        if (first_name !== undefined) {
          updateUserFields.push(`first_name = $${paramIndex}`);
          updateUserValues.push(first_name);
          paramIndex++;
        }
        if (last_name !== undefined) {
          updateUserFields.push(`last_name = $${paramIndex}`);
          updateUserValues.push(last_name);
          paramIndex++;
        }
        if (email !== undefined) {
          // Check if email already exists
          const existingEmail = await client.query(
            'SELECT id FROM users WHERE lower(email) = lower($1) AND id != $2',
            [email, userId]
          );
          if (existingEmail.rows.length > 0) {
            throw new Error('email_already_exists');
          }
          updateUserFields.push(`email = $${paramIndex}`);
          updateUserValues.push(email);
          paramIndex++;
        }
        if (mobile !== undefined) {
          updateUserFields.push(`phone = $${paramIndex}`);
          updateUserValues.push(mobile);
          paramIndex++;
        }

        if (updateUserFields.length > 0) {
          updateUserValues.push(userId);
          await client.query(
            `UPDATE users SET ${updateUserFields.join(', ')} WHERE id = $${paramIndex}`,
            updateUserValues
          );
        }
      }

      // Validate referenced clinics/services exist before upserting (follow workflow: clinics and services must exist first)
      const clinicIdsFromIds = Array.isArray(clinic_ids) ? clinic_ids.filter(Boolean) : [];
      const clinicIdsFromMappings = Array.isArray(clinic_mappings) ? clinic_mappings.map(m => m && m.clinic_id).filter(Boolean) : [];
      const clinicIdsFromServices = Array.isArray(clinic_services) ? clinic_services.map(s => s && s.clinic_id).filter(Boolean) : [];
      const allClinicIds = Array.from(new Set([...clinicIdsFromIds, ...clinicIdsFromMappings, ...clinicIdsFromServices]));

      if (allClinicIds.length > 0) {
        const clinicsRes = await client.query(`SELECT id FROM vet_clinics WHERE id = ANY($1) AND deleted_at IS NULL`, [allClinicIds]);
        const found = clinicsRes.rows.map(r => r.id);
        const missing = allClinicIds.filter(id => !found.includes(id));
        if (missing.length > 0) {
          throw new Error('clinics_missing:' + missing.join(','));
        }
      }

      const serviceIdsFromIds = Array.isArray(service_ids) ? service_ids.filter(Boolean) : [];
      const serviceIdsFromServices = Array.isArray(clinic_services) ? clinic_services.map(s => s && s.service_id).filter(Boolean) : [];
      const allServiceIds = Array.from(new Set([...serviceIdsFromIds, ...serviceIdsFromServices]));

      if (allServiceIds.length > 0) {
        const servicesRes = await client.query(`SELECT id FROM vet_services WHERE id = ANY($1) AND deleted_at IS NULL`, [allServiceIds]);
        const foundSvc = servicesRes.rows.map(r => r.id);
        const missingSvc = allServiceIds.filter(id => !foundSvc.includes(id));
        if (missingSvc.length > 0) {
          throw new Error('services_missing:' + missingSvc.join(','));
        }
      }

      const result = await client.query(
        `UPDATE veterinarians
         SET employee_id = COALESCE($2, employee_id),
             license_number = COALESCE($3, license_number),
             specialization = COALESCE($4, specialization),
             qualification = COALESCE($5, qualification),
             experience_years = COALESCE($6, experience_years),
             consultation_fee = COALESCE($7, consultation_fee),
             emergency_fee = COALESCE($8, emergency_fee),
             bio = COALESCE($9, bio),
             avatar_url = COALESCE($10, avatar_url),
             status = COALESCE($11, status),
             is_available_for_emergency = COALESCE($12, is_available_for_emergency)
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, updated_at`,
        [
          req.params.id,
          employee_id === undefined ? null : employee_id,
          license_number === undefined ? null : license_number,
          specialization === undefined ? null : specialization,
          qualification === undefined ? null : qualification,
          experience_years === undefined ? null : experience_years,
          consultation_fee === undefined ? null : consultation_fee,
          emergency_fee === undefined ? null : emergency_fee,
          bio === undefined ? null : bio,
          avatar_url === undefined ? null : avatar_url,
          status === undefined ? null : status,
          is_available_for_emergency === undefined ? null : is_available_for_emergency
        ]
      );

      if (result.rows.length === 0) throw new Error('not_found');

      // Do NOT create separate clinic mappings.
      // Accept `clinic_ids` only as context for `service_ids` when provided.
      const providedClinicIds = Array.isArray(clinic_ids) ? clinic_ids.filter(Boolean) : [];



      // handle clinic services (detailed) - now stored on vet_clinic_mappings.service_ids
      if (Array.isArray(clinic_services) && clinic_services.length > 0) {
        const servicesPerClinic = new Map();
        for (const s of clinic_services) {
          const { clinic_id, service_id } = s;
          if (!clinic_id || !service_id) continue;
          if (!servicesPerClinic.has(clinic_id)) servicesPerClinic.set(clinic_id, new Set());
          servicesPerClinic.get(clinic_id).add(service_id);
        }

        for (const [clinicId, svcSet] of servicesPerClinic.entries()) {
          const svcArray = Array.from(svcSet);
          await client.query(
            `INSERT INTO vet_clinic_mappings (veterinarian_id, clinic_id, is_primary, consultation_fee_override, service_ids, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5, now(), now())
             ON CONFLICT (veterinarian_id, clinic_id) DO UPDATE
             SET service_ids = COALESCE(EXCLUDED.service_ids, vet_clinic_mappings.service_ids),
                 updated_at = now()`,
            [req.params.id, clinicId, false, null, JSON.stringify(svcArray)]
          );
        }
      }

      // handle simple service ids (legacy `service_ids` or new `vet_service_ids`) - attach to a single clinic mapping
      const simpleServiceIds = (Array.isArray(vet_service_ids) && vet_service_ids.length > 0) ? vet_service_ids : (Array.isArray(service_ids) ? service_ids : []);
      if (simpleServiceIds.length > 0) {
        // fetch clinics that the veterinarian already has mappings for
        const clinicsRes = await client.query(`SELECT DISTINCT clinic_id FROM vet_clinic_mappings WHERE veterinarian_id = $1 AND deleted_at IS NULL`, [req.params.id]);
        let clinicIds = clinicsRes.rows.map(r => r.clinic_id);

        // If no existing mappings, consider provided clinic_ids in this update as context (must be exactly one) or explicit vet_clinic_id
        if (clinicIds.length === 0) {
          if (providedClinicIds && providedClinicIds.length === 1) {
            clinicIds = [providedClinicIds[0]];
          } else if (singleVetClinicId) {
            clinicIds = [singleVetClinicId];
          } else {
            throw new Error('service_without_clinic');
          }
        }

        if (clinicIds.length > 1) {
          throw new Error('service_ambiguous_clinic');
        }

        const targetClinicId = clinicIds[0];

        // Upsert mapping for the target clinic with the provided service ids
        await client.query(
          `INSERT INTO vet_clinic_mappings (veterinarian_id, clinic_id, is_primary, consultation_fee_override, service_ids, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5, now(), now())
           ON CONFLICT (veterinarian_id, clinic_id) DO UPDATE
           SET service_ids = COALESCE(EXCLUDED.service_ids, vet_clinic_mappings.service_ids),
               updated_at = now()`,
          [req.params.id, targetClinicId, true, null, JSON.stringify(simpleServiceIds)]
        );
      }

      return result.rows[0];
    });

    if (!updated) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(updated, 'Updated'));
  } catch (err) {
    // logger.error('Update veterinarian failed', { error: err.message });
    if (err.message === 'email_already_exists') {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }

    if (err.message && err.message.startsWith('clinics_missing:')) {
      const ids = err.message.split(':')[1].split(',');
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'clinic_ids', msg: `Clinics not found: ${ids.join(',')}` }] });
    }

    if (err.message && err.message.startsWith('services_missing:')) {
      const ids = err.message.split(':')[1].split(',');
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'service_ids', msg: `Services not found: ${ids.join(',')}` }] });
    }

    if (err.message === 'service_without_clinic') {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'vet_service_ids', msg: 'service ids require clinic context (provide `vet_clinic_id` or `clinic_services` in the update).' }] });
    }

    if (err.message === 'service_ambiguous_clinic') {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: [{ param: 'vet_service_ids', msg: 'Ambiguous clinic context: veterinarian has multiple clinics, provide `clinic_services` entries to specify clinic for each service.' }] });
    }

    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const delete_veterinarian = async (req, res) => {
  try {
    const result = await query(
      `UPDATE veterinarians SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }

    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    // logger.error('Delete veterinarian failed', { error: err.message });
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, getById, create, update, delete: delete_veterinarian };
