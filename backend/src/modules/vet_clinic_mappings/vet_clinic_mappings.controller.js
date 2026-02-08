// src/modules/vet_clinic_mappings/vet_clinic_mappings.controller.js - DEPRECATED
// ============================================================

const DEP_MSG = 'The `vet_clinic_mappings` endpoints have been removed. Manage clinic -> service assignments via the `veterinarians` create/update endpoints (`vet_clinic_id` + `vet_service_ids` or `clinicServices`).';

const gone = (req, res) => res.status(410).json({ status: 'error', message: DEP_MSG });

module.exports = { list: gone, getById: gone, create: gone, update: gone, delete: gone };
