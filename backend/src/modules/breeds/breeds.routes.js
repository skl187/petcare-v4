// src/modules/breeds/breeds.routes.js - ROUTES
// ============================================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../../core/auth/auth.middleware');
const { authorize } = require('../../core/rbac/rbac.middleware');
const controller = require('./breeds.controller');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }
  next();
};
/*
router.get('/', requireAuth, authorize('read', 'breed'), controller.list);
router.get('/:id', requireAuth, authorize('read', 'breed'), controller.getById);
router.post('/', [
  requireAuth,
  authorize('create', 'breed'),
  body('name').trim().notEmpty(),
  body('petTypeId').notEmpty().isUUID()
], handleValidationErrors, controller.create);
router.put('/:id', [
  requireAuth,
  authorize('update', 'breed'),
  body('name').optional().trim().notEmpty(),
  body('petTypeId').optional().notEmpty().isUUID()
], handleValidationErrors, controller.update);
router.delete('/:id', requireAuth, authorize('delete', 'breed'), controller.delete);
*/
router.get('/', controller.list);
router.get('/:id', requireAuth, controller.getById);
router.post('/', [
  requireAuth,
  body('name').trim().notEmpty(),
  body('petTypeId').notEmpty().isUUID()
], handleValidationErrors, controller.create);
router.put('/:id', [
  requireAuth,
  body('name').optional().trim().notEmpty(),
  body('petTypeId').optional().notEmpty().isUUID()
], handleValidationErrors, controller.update);
router.delete('/:id', requireAuth, controller.delete);

module.exports = router;
