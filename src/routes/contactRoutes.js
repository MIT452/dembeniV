const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validate, contactValidators } = require('../middleware/validateMiddleware');

router.post('/', validate(contactValidators.send), contactController.sendContactEmail);

module.exports = router;
