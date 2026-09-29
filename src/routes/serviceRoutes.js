const express = require('express');
const router = express.Router();
const { 
    getServices, 
    getServiceById, 
    createService, 
    updateService, 
    deleteService 
} = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const uploadService = require('../middleware/uploadServiceMiddleware');

router.route('/')
    .get(getServices)
    .post(protect, adminOnly, uploadService.single('image'), createService);

router.route('/:id')
    .get(getServiceById)
    .put(protect, adminOnly, uploadService.single('image'), updateService)
    .delete(protect, adminOnly, deleteService);

module.exports = router;
