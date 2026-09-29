const express = require('express');
const router = express.Router();
const { getMyDemandes, createDemande, getNotifications, markNotificationsRead } = require('../controllers/demandeController');
const { protect } = require('../middleware/authMiddleware');
const { validate, demandeValidators } = require('../middleware/validateMiddleware');

router.use(protect);

router.route('/')
    .get(getMyDemandes)
    .post(validate(demandeValidators.create), createDemande);

router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

module.exports = router;
