const express = require('express');
const router = express.Router();
const { getActualites, createActualite, updateActualite, deleteActualite } = require('../controllers/actualiteController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(getActualites)
    .post(protect, adminOnly, createActualite);

router.route('/:id')
    .put(protect, adminOnly, updateActualite)
    .delete(protect, adminOnly, deleteActualite);

module.exports = router;
