// src/modules/payments/payments.routes.js
// ============================================================

const express = require('express');
const router = express.Router();
const controller = require('./payments.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

// veterinarian-specific payment listing
router.get('/vet', requireAuth, controller.listVetPayments);

// admin — all payments
router.get('/all', requireAuth, controller.listAllPayments);

// owner — own payments
router.get('/user', requireAuth, controller.listUserPayments);

// update payment status (vet or admin)
router.patch('/:id', requireAuth, controller.updatePaymentStatus);

module.exports = router;
