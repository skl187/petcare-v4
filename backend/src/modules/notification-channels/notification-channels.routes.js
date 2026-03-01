const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../core/auth/auth.middleware');
const controller = require('./notification-channels.controller');

// All notification channel routes require authentication
router.use(requireAuth);

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:slug', controller.update);
router.delete('/:slug', controller.delete);

module.exports = router;
