// src/modules/veterinarians/veterinarians.routes.js - ROUTES
// ============================================================

const express = require('express');
const { requireAuth } = require('../../core/auth/auth.middleware');
const controller = require('./veterinarians.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', requireAuth, controller.getById);
router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.delete);

module.exports = router;
