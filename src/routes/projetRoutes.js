const express = require('express');
const router = express.Router();
const {
    getProjets,
    getProjetById,
    createProjet,
    updateProjet,
    addGalleryImage,
    removeGalleryImage,
    deleteProjet,
    getProjetStats
} = require('../controllers/projetController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const uploadProjet = require('../middleware/uploadProjetMiddleware');

// Public routes
router.get('/stats', getProjetStats);
router.get('/', getProjets);
router.get('/:id', getProjetById);

// Protected admin routes
router.post('/', protect, adminOnly, uploadProjet.single('image'), createProjet);
router.put('/:id', protect, adminOnly, uploadProjet.single('image'), updateProjet);
router.delete('/:id', protect, adminOnly, deleteProjet);

// Gallery routes
router.post('/:id/gallery', protect, adminOnly, uploadProjet.single('image'), addGalleryImage);
router.delete('/:id/gallery', protect, adminOnly, removeGalleryImage);

module.exports = router;
