const express = require('express');
const router = express.Router();
const { getMyRendezVous, createRendezVous } = require('../controllers/rendezVousController');
const { protect } = require('../middleware/authMiddleware');
const { validate, rendezvousValidators } = require('../middleware/validateMiddleware');

router.use(protect);

router.route('/')
    .get(getMyRendezVous)
    .post(validate(rendezvousValidators.create), createRendezVous);

module.exports = router;
