const express = require('express');
const router = express.Router();
const { getWelcomeMessage } = require('../controllers/exampleController');

router.get('/', getWelcomeMessage);

module.exports = router;
