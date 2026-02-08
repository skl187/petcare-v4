// src/modules/pets/pets.routes.js - ROUTES
// ============================================================

const express = require('express');
const { requireAuth } = require('../../core/auth/auth.middleware');
const { authorize } = require('../../core/rbac/rbac.middleware');
const controller = require('./pets.controller');

const router = express.Router();
/*
// Public listing and retrieve
router.get('/', requireAuth, authorize('read', 'pet'), controller.list);
router.get('/:id', requireAuth, authorize('read', 'pet'), controller.getById);

// Create
router.post('/', requireAuth, authorize('create', 'pet'), controller.create);

// Update
router.put('/:id', requireAuth, authorize('update', 'pet'), controller.update);

// Delete (soft delete)
router.delete('/:id', requireAuth, authorize('delete', 'pet'), controller.delete);
*/
// Public listing and retrieve
router.get('/', requireAuth, controller.list);
router.get('/:id', requireAuth, controller.getById);

// Create
router.post('/', requireAuth, controller.create);

// Update
router.put('/:id', requireAuth, controller.update);

// Delete (soft delete)
router.delete('/:id', requireAuth, controller.delete);

module.exports = router;
