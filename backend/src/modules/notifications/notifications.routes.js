const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');

// Create a notification (schedule or send immediately)
router.post('/', controller.create);
// Preview rendered template with payload
router.post('/preview', controller.preview);

router.get('/pending', controller.listPending);
router.get('/:id', controller.getById);
router.post('/:id/resend', controller.resend);

module.exports = router;
