const { query, transaction } = require('../../core/db/pool');

// ─────────────────────────────────────────────
// Helper: resolve veterinarian id from user id
// ─────────────────────────────────────────────
const getVetId = async (userId) => {
  const { rows } = await query(
    `SELECT id FROM veterinarians WHERE user_id = $1 AND deleted_at IS NULL LIMIT 1`,
    [userId]
  );
  return rows[0]?.id || null;
};

// ─────────────────────────────────────────────
// ADMIN: list all services with clinic & vet info
// ─────────────────────────────────────────────
const adminListServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['vs.deleted_at IS NULL'];
    const params = [];

    if (status !== undefined) {
      params.push(status);
      conditions.push(`vs.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(vs.name ILIKE $${params.length} OR vs.code ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit, offset);

    const sql = `
      SELECT
        vs.id,
        vs.code,
        vs.name,
        vs.description,
        vs.default_duration_minutes,
        vs.default_fee,
        vs.service_type,
        vs.status,
        vs.created_at,
        vs.updated_at,
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'mapping_id',   vcm.id,
              'clinic_id',    vc.id,
              'clinic_name',  vc.name,
              'vet_id',       v.id,
              'vet_name',     u.first_name || ' ' || u.last_name,
              'fee_override', vcm.consultation_fee_override
            )
          ) FILTER (WHERE vcm.id IS NOT NULL AND vcm.deleted_at IS NULL),
          '[]'
        ) AS clinic_vet_mappings,
        COUNT(*) OVER() AS total_count
      FROM vet_services vs
      LEFT JOIN vet_clinic_mappings vcm
        ON vs.id = ANY(
          ARRAY(SELECT jsonb_array_elements_text(vcm.service_ids)::uuid)
        )
      LEFT JOIN vet_clinics vc ON vcm.clinic_id = vc.id
      LEFT JOIN veterinarians v ON vcm.veterinarian_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      ${where}
      GROUP BY vs.id
      ORDER BY vs.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await query(sql, params);
    const total = rows[0]?.total_count || 0;

    res.json({
      success: true,
      data: rows.map(({ total_count, ...r }) => r),
      pagination: { page: Number(page), limit: Number(limit), total: Number(total) }
    });
  } catch (err) {
    console.error('adminListServices error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// ADMIN: get single service detail
// ─────────────────────────────────────────────
const adminGetService = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      `SELECT
        vs.*,
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'mapping_id',   vcm.id,
              'clinic_id',    vc.id,
              'clinic_name',  vc.name,
              'vet_id',       v.id,
              'vet_name',     u.first_name || ' ' || u.last_name,
              'fee_override', vcm.consultation_fee_override
            )
          ) FILTER (WHERE vcm.id IS NOT NULL AND vcm.deleted_at IS NULL),
          '[]'
        ) AS clinic_vet_mappings
      FROM vet_services vs
      LEFT JOIN vet_clinic_mappings vcm
        ON vs.id = ANY(
          ARRAY(SELECT jsonb_array_elements_text(vcm.service_ids)::uuid)
        )
      LEFT JOIN vet_clinics vc ON vcm.clinic_id = vc.id
      LEFT JOIN veterinarians v ON vcm.veterinarian_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE vs.id = $1 AND vs.deleted_at IS NULL
      GROUP BY vs.id`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('adminGetService error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// ADMIN: update any service
// ─────────────────────────────────────────────
const adminUpdateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, default_duration_minutes, default_fee, service_type, status, code } = req.body;
    const userId = req.user.id;

    const { rows } = await query(
      `UPDATE vet_services SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        default_duration_minutes = COALESCE($3, default_duration_minutes),
        default_fee = COALESCE($4, default_fee),
        service_type = COALESCE($5, service_type),
        status = COALESCE($6, status),
        code = COALESCE($7, code),
        updated_by = $8,
        updated_at = now()
      WHERE id = $9 AND deleted_at IS NULL
      RETURNING *`,
      [name, description, default_duration_minutes, default_fee, service_type, status, code, userId, id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('adminUpdateService error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// ADMIN: soft-delete service + remove from all mappings
// ─────────────────────────────────────────────
const adminDeleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await transaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE vet_services SET deleted_at = now(), updated_at = now()
         WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        [id]
      );

      if (!rows.length) return null;

      await client.query(
        `UPDATE vet_clinic_mappings
         SET service_ids = (
           SELECT COALESCE(JSONB_AGG(sid), '[]'::jsonb)
           FROM JSONB_ARRAY_ELEMENTS_TEXT(service_ids) sid
           WHERE sid::uuid != $1
         ),
         updated_at = now()
         WHERE service_ids @> $2::jsonb AND deleted_at IS NULL`,
        [id, JSON.stringify([id])]
      );

      return rows[0];
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    console.error('adminDeleteService error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// VET: get mapped clinics (dropdown for create)
// ─────────────────────────────────────────────
const vetGetMappedClinics = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ success: false, message: 'Vet profile not found' });

    const { rows } = await query(
      `SELECT vc.id, vc.name, vc.slug, vc.contact_email, vc.contact_number,
              vc.emergency_number, vc.is_emergency_available, vc.is_24x7,
              vcm.is_primary, vcm.consultation_fee_override
       FROM vet_clinic_mappings vcm
       JOIN vet_clinics vc ON vcm.clinic_id = vc.id
       WHERE vcm.veterinarian_id = $1 AND vcm.deleted_at IS NULL
       ORDER BY vcm.is_primary DESC, vc.name`,
      [vetId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('vetGetMappedClinics error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// VET: list own services
// ─────────────────────────────────────────────
const vetListServices = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ success: false, message: 'Vet profile not found' });

    const { page = 1, limit = 20, clinic_id, status } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [
      'vs.deleted_at IS NULL',
      'vcm.veterinarian_id = $1',
      'vcm.deleted_at IS NULL'
    ];
    const params = [vetId];

    if (clinic_id) {
      params.push(clinic_id);
      conditions.push(`vcm.clinic_id = $${params.length}`);
    }

    if (status !== undefined) {
      params.push(status);
      conditions.push(`vs.status = $${params.length}`);
    }

    params.push(limit, offset);

    const { rows } = await query(
      `SELECT
        vs.id,
        vs.code,
        vs.name,
        vs.description,
        vs.default_duration_minutes,
        vs.default_fee,
        vs.service_type,
        vs.status,
        vs.created_at,
        vc.id   AS clinic_id,
        vc.name AS clinic_name,
        vcm.consultation_fee_override,
        COALESCE(vcm.consultation_fee_override, vs.default_fee) AS effective_fee,
        COUNT(*) OVER() AS total_count
      FROM vet_clinic_mappings vcm
      JOIN vet_clinics vc ON vcm.clinic_id = vc.id
      JOIN vet_services vs
        ON vs.id = ANY(
          ARRAY(SELECT jsonb_array_elements_text(vcm.service_ids)::uuid)
        )
      WHERE ${conditions.join(' AND ')}
      ORDER BY vc.name, vs.name
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = rows[0]?.total_count || 0;

    res.json({
      success: true,
      data: rows.map(({ total_count, ...r }) => r),
      pagination: { page: Number(page), limit: Number(limit), total: Number(total) }
    });
  } catch (err) {
    console.error('vetListServices error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// VET: create service + attach to clinic mapping
// ─────────────────────────────────────────────
const vetCreateService = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ success: false, message: 'Vet profile not found' });

    const userId = req.user.id;
    const { clinic_id, code, name, description, default_duration_minutes = 30, default_fee = 0, service_type } = req.body;

    if (!clinic_id || !name) {
      return res.status(400).json({ success: false, message: 'clinic_id and name are required' });
    }

    const service = await transaction(async (client) => {
      const mappingRes = await client.query(
        `SELECT id, service_ids FROM vet_clinic_mappings
         WHERE veterinarian_id = $1 AND clinic_id = $2 AND deleted_at IS NULL`,
        [vetId, clinic_id]
      );

      if (!mappingRes.rows.length) {
        const err = new Error('You are not mapped to this clinic');
        err.statusCode = 403;
        throw err;
      }

      const mapping = mappingRes.rows[0];

      const serviceRes = await client.query(
        `INSERT INTO vet_services
           (code, name, description, default_duration_minutes, default_fee, service_type, status, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $7)
         RETURNING *`,
        [code || null, name, description || null, default_duration_minutes, default_fee, service_type || null, userId]
      );

      const newService = serviceRes.rows[0];
      const currentIds = mapping.service_ids || [];
      const updatedIds = [...currentIds, newService.id];

      await client.query(
        `UPDATE vet_clinic_mappings
         SET service_ids = $1::jsonb, updated_at = now()
         WHERE id = $2`,
        [JSON.stringify(updatedIds), mapping.id]
      );

      return newService;
    });

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    if (err.statusCode === 403) {
      return res.status(403).json({ success: false, message: err.message });
    }
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Service code already exists' });
    }
    console.error('vetCreateService error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// VET: update own service
// ─────────────────────────────────────────────
const vetUpdateService = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ success: false, message: 'Vet profile not found' });

    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, default_duration_minutes, default_fee, service_type, status, code } = req.body;

    const updated = await transaction(async (client) => {
      const ownerCheck = await client.query(
        `SELECT vcm.id FROM vet_clinic_mappings vcm
         WHERE vcm.veterinarian_id = $1
           AND vcm.service_ids @> $2::jsonb
           AND vcm.deleted_at IS NULL
         LIMIT 1`,
        [vetId, JSON.stringify([id])]
      );

      if (!ownerCheck.rows.length) {
        const err = new Error('Service not found or access denied');
        err.statusCode = 403;
        throw err;
      }

      const { rows } = await client.query(
        `UPDATE vet_services SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          default_duration_minutes = COALESCE($3, default_duration_minutes),
          default_fee = COALESCE($4, default_fee),
          service_type = COALESCE($5, service_type),
          status = COALESCE($6, status),
          code = COALESCE($7, code),
          updated_by = $8,
          updated_at = now()
        WHERE id = $9 AND deleted_at IS NULL
        RETURNING *`,
        [name, description, default_duration_minutes, default_fee, service_type, status, code, userId, id]
      );

      return rows[0] || null;
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.statusCode === 403) {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error('vetUpdateService error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// VET: soft-delete own service + remove from mapping
// ─────────────────────────────────────────────
const vetDeleteService = async (req, res) => {
  try {
    const vetId = await getVetId(req.user.id);
    if (!vetId) return res.status(403).json({ success: false, message: 'Vet profile not found' });

    const { id } = req.params;

    await transaction(async (client) => {
      const ownerCheck = await client.query(
        `SELECT id FROM vet_clinic_mappings
         WHERE veterinarian_id = $1
           AND service_ids @> $2::jsonb
           AND deleted_at IS NULL
         LIMIT 1`,
        [vetId, JSON.stringify([id])]
      );

      if (!ownerCheck.rows.length) {
        const err = new Error('Service not found or access denied');
        err.statusCode = 403;
        throw err;
      }

      await client.query(
        `UPDATE vet_services SET deleted_at = now(), updated_at = now() WHERE id = $1`,
        [id]
      );

      await client.query(
        `UPDATE vet_clinic_mappings
         SET service_ids = (
           SELECT COALESCE(JSONB_AGG(sid), '[]'::jsonb)
           FROM JSONB_ARRAY_ELEMENTS_TEXT(service_ids) sid
           WHERE sid::uuid != $1
         ),
         updated_at = now()
         WHERE veterinarian_id = $2
           AND service_ids @> $3::jsonb
           AND deleted_at IS NULL`,
        [id, vetId, JSON.stringify([id])]
      );
    });

    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    if (err.statusCode === 403) {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error('vetDeleteService error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// PUBLIC / BOOKING: active services only (status=1)
// ─────────────────────────────────────────────
const getActiveServicesForBooking = async (req, res) => {
  try {
    const { vet_id, clinic_id } = req.query;

    if (!vet_id || !clinic_id) {
      return res.status(400).json({ success: false, message: 'vet_id and clinic_id are required' });
    }

    const { rows } = await query(
      `SELECT
        vs.id,
        vs.name,
        vs.description,
        vs.default_duration_minutes,
        vs.service_type,
        COALESCE(vcm.consultation_fee_override, vs.default_fee) AS fee
       FROM vet_clinic_mappings vcm
       JOIN vet_services vs
         ON vs.id = ANY(
           ARRAY(SELECT jsonb_array_elements_text(vcm.service_ids)::uuid)
         )
       WHERE vcm.veterinarian_id = $1
         AND vcm.clinic_id = $2
         AND vcm.deleted_at IS NULL
         AND vs.deleted_at IS NULL
         AND vs.status = 1
       ORDER BY vs.name`,
      [vet_id, clinic_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getActiveServicesForBooking error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  adminListServices,
  adminGetService,
  adminUpdateService,
  adminDeleteService,
  vetGetMappedClinics,
  vetCreateService,
  vetListServices,
  vetUpdateService,
  vetDeleteService,
  getActiveServicesForBooking
};