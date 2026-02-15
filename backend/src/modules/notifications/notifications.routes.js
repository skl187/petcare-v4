const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');

router.get('/pending', controller.listPending);
router.get('/:id', controller.getById);
router.post('/:id/resend', controller.resend);

module.exports = router;
