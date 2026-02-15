const express = require('express');
const router = express.Router();
const controller = require('./notification-channels.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:slug', controller.update);
router.delete('/:slug', controller.delete);

module.exports = router;
