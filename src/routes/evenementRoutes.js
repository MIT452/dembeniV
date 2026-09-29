const express = require('express');
const router = express.Router();
const { getEvenements, createEvenement, updateEvenement, deleteEvenement } = require('../controllers/evenementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(getEvenements)
    .post(protect, adminOnly, createEvenement);

router.route('/:id')
    .put(protect, adminOnly, updateEvenement)
    .delete(protect, adminOnly, deleteEvenement);

module.exports = router;
