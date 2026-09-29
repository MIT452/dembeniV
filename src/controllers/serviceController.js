const Service = require('../models/Service');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// Helper to delete local file
const deleteLocalFile = (filePath) => {
    if (!filePath || !filePath.startsWith('/public/uploads/')) return;
    const absPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(absPath)) {
        fs.unlink(absPath, (err) => {
            if (err) console.error('Erreur suppression fichier service:', err.message);
        });
    }
};

// Parse JSON fields safely helper
const parseJSON = (val, fallback = []) => {
    if (!val) return fallback;
    if (Array.isArray(val)) return val;
    try {
        return JSON.parse(val);
    } catch (e) {
        return fallback;
    }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
    // If request has admin query or authorization headers, we can show all,
    // otherwise show only visible services.
    const filter = {};
    if (req.query.visibleOnly === 'true') {
        filter.isVisible = true;
    }
    
    if (req.query.category) {
        filter.category = req.query.category;
    }

    const services = await Service.find(filter).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
});

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service non trouvé');
    }

    res.status(200).json({ success: true, data: service });
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
    const {
        title, desc, fullDesc, icon, category, location, hours,
        phone, email, delay, onlineStatus, badge, order, isVisible,
        documents, steps, faq, formulaireUrls, associatedDemarches
    } = req.body;

    if (!title || !desc || !category) {
        res.status(400);
        throw new Error('Veuillez remplir tous les champs requis (titre, description courte et catégorie)');
    }

    let imagePath = '';
    if (req.file) {
        imagePath = req.file.path;
    } else if (req.body.img) {
        imagePath = req.body.img;
    }

    const service = await Service.create({
        title,
        desc,
        fullDesc,
        icon: icon || 'FileText',
        img: imagePath,
        category,
        location,
        hours,
        phone,
        email,
        delay,
        onlineStatus,
        badge,
        order: parseInt(order) || 0,
        isVisible: isVisible !== 'false' && isVisible !== false,
        documents: parseJSON(documents),
        steps: parseJSON(steps),
        faq: parseJSON(faq),
        formulaireUrls: parseJSON(formulaireUrls),
        associatedDemarches: parseJSON(associatedDemarches)
    });

    res.status(201).json({ success: true, data: service });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service non trouvé');
    }

    // Handle image replacement
    let imagePath = service.img;
    if (req.file) {
        deleteLocalFile(service.img);
        imagePath = req.file.path;
    } else if (req.body.img !== undefined) {
        imagePath = req.body.img;
    }

    const updateData = {
        title: req.body.title || service.title,
        desc: req.body.desc || service.desc,
        fullDesc: req.body.fullDesc !== undefined ? req.body.fullDesc : service.fullDesc,
        icon: req.body.icon || service.icon,
        img: imagePath,
        category: req.body.category || service.category,
        location: req.body.location !== undefined ? req.body.location : service.location,
        hours: req.body.hours !== undefined ? req.body.hours : service.hours,
        phone: req.body.phone !== undefined ? req.body.phone : service.phone,
        email: req.body.email !== undefined ? req.body.email : service.email,
        delay: req.body.delay !== undefined ? req.body.delay : service.delay,
        onlineStatus: req.body.onlineStatus !== undefined ? req.body.onlineStatus : service.onlineStatus,
        badge: req.body.badge !== undefined ? req.body.badge : service.badge,
        order: req.body.order !== undefined ? parseInt(req.body.order) : service.order,
        isVisible: req.body.isVisible !== undefined ? (req.body.isVisible === 'true' || req.body.isVisible === true) : service.isVisible
    };

    if (req.body.documents !== undefined) updateData.documents = parseJSON(req.body.documents);
    if (req.body.steps !== undefined) updateData.steps = parseJSON(req.body.steps);
    if (req.body.faq !== undefined) updateData.faq = parseJSON(req.body.faq);
    if (req.body.formulaireUrls !== undefined) updateData.formulaireUrls = parseJSON(req.body.formulaireUrls);
    if (req.body.associatedDemarches !== undefined) updateData.associatedDemarches = parseJSON(req.body.associatedDemarches);

    const updated = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service non trouvé');
    }

    // Clean up file if exists
    deleteLocalFile(service.img);

    await service.deleteOne();
    res.status(200).json({ success: true, message: 'Service supprimé avec succès' });
});

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};
