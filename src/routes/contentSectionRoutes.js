const express = require('express');
const router = express.Router();
const {
    getContentSections,
    getContentSectionByKey,
    createContentSection,
    updateContentSection,
    deleteContentSection
} = require('../controllers/contentSectionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes for frontend data retrieval
router.get('/', getContentSections);
router.get('/:key', getContentSectionByKey);

// Protected Admin-only routes for content modification
router.post('/', protect, adminOnly, createContentSection);
router.put('/:key', protect, adminOnly, updateContentSection);
router.delete('/:key', protect, adminOnly, deleteContentSection);

module.exports = router;
