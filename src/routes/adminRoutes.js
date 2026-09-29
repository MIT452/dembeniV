const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    validateUser, 
    rejectUser, 
    deleteUser, 
    getDemandes, 
    respondToDemande, 
    getStats 
} = require('../controllers/adminController');
const {
    getAllSignalements,
    updateSignalement,
    deleteSignalement
} = require('../controllers/signalementController');
const {
    getAllRendezVous,
    updateRendezVous,
    deleteRendezVous
} = require('../controllers/rendezVousController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);
router.use(adminOnly);

// Citizens management
router.get('/users', getUsers);
router.put('/users/:id/validate', validateUser);
router.put('/users/:id/reject', rejectUser);
router.delete('/users/:id', deleteUser);

// Demands management
router.get('/demandes', getDemandes);
router.post('/demandes/:id/respond', respondToDemande);

// Signalements management
router.get('/signalements', getAllSignalements);
router.put('/signalements/:id', updateSignalement);
router.delete('/signalements/:id', deleteSignalement);

// Rendez-vous management
router.get('/rendezvous', getAllRendezVous);
router.put('/rendezvous/:id', updateRendezVous);
router.delete('/rendezvous/:id', deleteRendezVous);

// Dashboard Statistics
router.get('/stats', getStats);

module.exports = router;
