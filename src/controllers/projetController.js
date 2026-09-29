const Projet = require('../models/Projet');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// Helper: delete a local file safely
const deleteLocalFile = (filePath) => {
    if (!filePath || !filePath.startsWith('/public/uploads/')) return;
    const absPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(absPath)) {
        fs.unlink(absPath, (err) => {
            if (err) console.error('Erreur suppression fichier projet:', err.message);
        });
    }
};

// @desc    Get all projects (with optional filters)
// @route   GET /api/projets
// @access  Public
const getProjets = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.published !== 'all') filter.isPublished = true;

    const projets = await Projet.find(filter).sort({ isFeatured: -1, order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: projets.length, data: projets });
});

// @desc    Get single project by ID
// @route   GET /api/projets/:id
// @access  Public
const getProjetById = asyncHandler(async (req, res) => {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
        res.status(404);
        throw new Error('Projet non trouvé');
    }
    res.status(200).json({ success: true, data: projet });
});

// @desc    Create new project
// @route   POST /api/projets
// @access  Private/Admin
const createProjet = asyncHandler(async (req, res) => {
    const {
        title, description, fullDescription, category, status,
        budget, progress, startDate, endDate, objectives,
        timeline, documents, videos, location, isFeatured,
        isPublished, order
    } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Titre et description obligatoires');
    }

    // Parse JSON-encoded fields sent via FormData
    const parseJSON = (val, fallback = []) => {
        if (!val) return fallback;
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch { return fallback; }
    };

    let imagePath = '';
    if (req.file) {
        imagePath = req.file.path;
    } else if (req.body.image) {
        imagePath = req.body.image;
    }

    const projet = await Projet.create({
        title,
        description,
        fullDescription: fullDescription || '',
        category: category || 'Autre',
        status: status || 'En cours',
        image: imagePath,
        budget: budget || '',
        progress: parseInt(progress) || 0,
        startDate: startDate || null,
        endDate: endDate || null,
        objectives: parseJSON(objectives),
        timeline: parseJSON(timeline),
        documents: parseJSON(documents),
        videos: parseJSON(videos),
        location: location || 'Dembéni, Mayotte',
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isPublished: isPublished !== 'false' && isPublished !== false,
        order: parseInt(order) || 0
    });

    res.status(201).json({ success: true, data: projet });
});

// @desc    Update project
// @route   PUT /api/projets/:id
// @access  Private/Admin
const updateProjet = asyncHandler(async (req, res) => {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
        res.status(404);
        throw new Error('Projet non trouvé');
    }

    const parseJSON = (val, fallback = []) => {
        if (!val) return fallback;
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch { return fallback; }
    };

    // Handle image replacement
    let imagePath = projet.image;
    if (req.file) {
        deleteLocalFile(projet.image);
        imagePath = req.file.path;
    } else if (req.body.image !== undefined) {
        imagePath = req.body.image;
    }

    const updateData = {
        title: req.body.title || projet.title,
        description: req.body.description || projet.description,
        fullDescription: req.body.fullDescription !== undefined ? req.body.fullDescription : projet.fullDescription,
        category: req.body.category || projet.category,
        status: req.body.status || projet.status,
        image: imagePath,
        budget: req.body.budget !== undefined ? req.body.budget : projet.budget,
        progress: req.body.progress !== undefined ? parseInt(req.body.progress) : projet.progress,
        startDate: req.body.startDate || projet.startDate,
        endDate: req.body.endDate || projet.endDate,
        location: req.body.location !== undefined ? req.body.location : projet.location,
        isFeatured: req.body.isFeatured !== undefined ? (req.body.isFeatured === 'true' || req.body.isFeatured === true) : projet.isFeatured,
        isPublished: req.body.isPublished !== undefined ? (req.body.isPublished !== 'false' && req.body.isPublished !== false) : projet.isPublished,
        order: req.body.order !== undefined ? parseInt(req.body.order) : projet.order
    };

    if (req.body.objectives !== undefined) updateData.objectives = parseJSON(req.body.objectives);
    if (req.body.timeline !== undefined) updateData.timeline = parseJSON(req.body.timeline);
    if (req.body.documents !== undefined) updateData.documents = parseJSON(req.body.documents);
    if (req.body.videos !== undefined) updateData.videos = parseJSON(req.body.videos);
    if (req.body.gallery !== undefined) updateData.gallery = parseJSON(req.body.gallery);

    const updated = await Projet.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
});

// @desc    Add image to gallery
// @route   POST /api/projets/:id/gallery
// @access  Private/Admin
const addGalleryImage = asyncHandler(async (req, res) => {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
        res.status(404);
        throw new Error('Projet non trouvé');
    }
    if (!req.file) {
        res.status(400);
        throw new Error('Aucun fichier image fourni');
    }

    const galleryPath = req.file.path;
    projet.gallery.push(galleryPath);
    await projet.save();

    res.status(200).json({ success: true, data: projet });
});

// @desc    Remove image from gallery
// @route   DELETE /api/projets/:id/gallery
// @access  Private/Admin
const removeGalleryImage = asyncHandler(async (req, res) => {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
        res.status(404);
        throw new Error('Projet non trouvé');
    }
    
    const { imagePath } = req.body;
    deleteLocalFile(imagePath);
    projet.gallery = projet.gallery.filter(g => g !== imagePath);
    await projet.save();

    res.status(200).json({ success: true, data: projet });
});

// @desc    Delete project
// @route   DELETE /api/projets/:id
// @access  Private/Admin
const deleteProjet = asyncHandler(async (req, res) => {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
        res.status(404);
        throw new Error('Projet non trouvé');
    }

    // Clean up files
    deleteLocalFile(projet.image);
    projet.gallery.forEach(g => deleteLocalFile(g));

    await projet.deleteOne();
    res.status(200).json({ success: true, message: 'Projet supprimé avec succès' });
});

// @desc    Get project statistics
// @route   GET /api/projets/stats
// @access  Public
const getProjetStats = asyncHandler(async (req, res) => {
    const total = await Projet.countDocuments({ isPublished: true });
    const enCours = await Projet.countDocuments({ status: 'En cours', isPublished: true });
    const termines = await Projet.countDocuments({ status: 'Terminé', isPublished: true });
    const futurs = await Projet.countDocuments({ status: 'Futur', isPublished: true });

    const avgProgress = await Projet.aggregate([
        { $match: { isPublished: true, status: 'En cours' } },
        { $group: { _id: null, avg: { $avg: '$progress' } } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            total,
            enCours,
            termines,
            futurs,
            avgProgress: avgProgress[0] ? Math.round(avgProgress[0].avg) : 0
        }
    });
});

module.exports = {
    getProjets,
    getProjetById,
    createProjet,
    updateProjet,
    addGalleryImage,
    removeGalleryImage,
    deleteProjet,
    getProjetStats
};
