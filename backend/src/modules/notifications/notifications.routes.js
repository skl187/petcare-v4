const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../core/auth/auth.middleware');
const controller = require('./notifications.controller');

// All notification routes require authentication
router.use(requireAuth);

// Notification templates
router.get('/templates', controller.listTemplates);
router.post('/templates', controller.createTemplate);
router.get('/templates/:key', controller.getTemplateByKey);
router.put('/templates/:key', controller.updateTemplate);
router.delete('/templates/:key', controller.deleteTemplate);

// Create a notification (schedule or send immediately)
router.post('/', controller.create);
// Preview rendered template with payload
router.post('/preview', controller.preview);

router.get('/pending', controller.listPending);
router.get('/:id', controller.getById);
router.post('/:id/resend', controller.resend);

module.exports = router;
