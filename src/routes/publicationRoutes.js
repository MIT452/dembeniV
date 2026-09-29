const express = require('express');
const router = express.Router();
const {
    getPublications,
    getPublicationById,
    createPublication,
    updatePublication,
    deletePublication
} = require('../controllers/publicationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware'); // Optional auth middleware just to attach user if token present
const upload = require('../middleware/uploadMiddleware');

// Provide optional auth for GET methods to allow admins to see drafts, but public users to see only published
router.route('/')
    .get(optionalAuth, getPublications)
    .post(protect, adminOnly, upload.single('image'), createPublication);

router.route('/:id')
    .get(optionalAuth, getPublicationById)
    .put(protect, adminOnly, upload.single('image'), updatePublication)
    .delete(protect, adminOnly, deletePublication);

module.exports = router;

