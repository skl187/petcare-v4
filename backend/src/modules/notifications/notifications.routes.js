const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');

// Notification templates (CRUD stored in app_settings.namespace = 'notification_templates')
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
