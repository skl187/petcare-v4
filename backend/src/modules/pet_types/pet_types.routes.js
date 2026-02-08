// src/modules/pet_types/pet_types.routes.js - ROUTES
// ============================================================

const express = require('express');
const { requireAuth } = require('../../core/auth/auth.middleware');
const { authorize } = require('../../core/rbac/rbac.middleware');
const controller = require('./pet_types.controller');

const router = express.Router();
/*
router.get('/', requireAuth, authorize('read', 'pet_type'), controller.list);
router.get('/:id', requireAuth, authorize('read', 'pet_type'), controller.getById);
router.post('/', requireAuth, authorize('create', 'pet_type'), controller.create);
router.put('/:id', requireAuth, authorize('update', 'pet_type'), controller.update);
router.delete('/:id', requireAuth, authorize('delete', 'pet_type'), controller.delete);
*/
router.get('/', controller.list);
router.get('/:id', requireAuth, controller.getById);
router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.delete);

module.exports = router;
