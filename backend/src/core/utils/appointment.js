// src/core/utils/appointment.js
// ============================================================================
// Appointment Utility Functions
// ============================================================================

const { query } = require('../db/pool');

/**
 * Generate appointment number based on clinic and current date
 * Format: APPT-{clinic_slug}-{YYYYMMDD}-{sequence}
 * Example: APPT-main-clinic-20260126-000001
 */
const generateAppointmentNumber = async (clinicId) => {
  try {
    // Fetch clinic slug and name
    const clinicResult = await query(
      `SELECT slug, name FROM vet_clinics WHERE id = $1 AND deleted_at IS NULL`,
      [clinicId]
    );

    if (clinicResult.rows.length === 0) {
      throw new Error('Clinic not found');
    }

    const clinic = clinicResult.rows[0];
    
    // Generate clinic slug - use existing slug or derive from name
    const clinicSlug = clinic.slug
      ? clinic.slug.toLowerCase().replace(/[^a-z0-9]+/g, '')
      : clinic.name.toLowerCase().replace(/\s+/g, '');

    // Get current date in UTC (YYYYMMDD format)
    const now = new Date();
    const datepart = now.toISOString().slice(0, 10).replace(/-/g, '');

    // Get sequence number for today
    // Count appointments created today with same clinic
    const countResult = await query(
      `SELECT COUNT(*) as count FROM vet_appointments 
       WHERE clinic_id = $1 AND DATE(created_at AT TIME ZONE 'UTC') = $2`,
      [clinicId, datepart]
    );

    const sequenceNumber = (parseInt(countResult.rows[0].count) + 1).toString().padStart(6, '0');

    // Format: APPT-{clinic_slug}-{date}-{sequence}
    return `APPT-${clinicSlug}-${datepart}-${sequenceNumber}`;
  } catch (err) {
    throw new Error(`Failed to generate appointment number: ${err.message}`);
  }
};

module.exports = { generateAppointmentNumber };
