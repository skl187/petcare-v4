// src/modules/vet_clinic_mappings/vet_clinic_mappings.routes.js - ROUTES
// ============================================================

const express = require('express');
const router = express.Router();

const DEP_MSG = 'The `vet_clinic_mappings` endpoints have been removed. Manage mappings via `veterinarians` create/update only.';
const gone = (req, res) => res.status(410).json({ status: 'error', message: DEP_MSG });

router.get('/', gone);
router.get('/:id', gone);
router.post('/', gone);
router.put('/:id', gone);
router.delete('/:id', gone);

module.exports = router;
