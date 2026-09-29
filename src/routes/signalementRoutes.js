const express = require('express');
const router = express.Router();
const { getMySignalements, createSignalement } = require('../controllers/signalementController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
    .get(getMySignalements)
    .post(upload.single('image'), createSignalement);

module.exports = router;
