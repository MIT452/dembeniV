const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const Publication = require('../models/Publication');

// Helper to delete local uploaded images
const deleteOldImage = (imagePath) => {
    if (imagePath && imagePath.startsWith('/public/uploads/actualites/')) {
        const fullPath = path.join(__dirname, '../..', imagePath);
        fs.unlink(fullPath, (err) => {
            if (err) {
                console.error("Erreur lors de la suppression de l'ancienne image:", err);
            } else {
                console.log("Ancienne image supprimée avec succès:", fullPath);
            }
        });
    }
};

// @desc    Get all publications (with optional filters)
// @route   GET /api/publications
// @access  Public
const getPublications = asyncHandler(async (req, res) => {
    const { type, category, status, isFeatured, isPinned, isUrgent, showOnHomepage, limit } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    
    if (category) {
        query.$or = [
            { category: category },
            { secondaryCategories: category }
        ];
    }
    
    if (status) query.status = status;
    else if (!req.user || req.user.role !== 'admin') {
        // By default, public users only see published content
        query.status = 'published';
    }
    
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isPinned) query.isPinned = isPinned === 'true';
    if (isUrgent) query.isUrgent = isUrgent === 'true';
    if (showOnHomepage) query.showOnHomepage = showOnHomepage === 'true';

    let mongooseQuery = Publication.find(query).sort({ createdAt: -1 });
    
    if (limit) {
        mongooseQuery = mongooseQuery.limit(Number(limit));
    }

    const publications = await mongooseQuery;

    res.status(200).json({
        success: true,
        count: publications.length,
        data: publications
    });
});

// @desc    Get single publication (by ID or Slug)
// @route   GET /api/publications/:id
// @access  Public
const getPublicationById = asyncHandler(async (req, res) => {
    const mongoose = require('mongoose');
    let query = {};
    
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        query._id = req.params.id;
    } else {
        query.slug = req.params.id;
    }

    const publication = await Publication.findOne(query);

    if (!publication) {
        res.status(404);
        throw new Error('Publication introuvable');
    }

    // If it's a draft, only admin can see it
    if (publication.status === 'draft') {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Accès non autorisé');
        }
    }

    res.status(200).json({
        success: true,
        data: publication
    });
});

// @desc    Create new publication
// @route   POST /api/publications
// @access  Private/Admin
const createPublication = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.author = req.user.id;

    // Handle FormData parsing for tags and secondaryCategories (strings -> arrays)
    if (typeof req.body.tags === 'string') {
        req.body.tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    }
    if (typeof req.body.secondaryCategories === 'string') {
        req.body.secondaryCategories = req.body.secondaryCategories ? req.body.secondaryCategories.split(',').map(c => c.trim()).filter(c => c) : [];
    }
    
    // Parse gallery
    if (typeof req.body.gallery === 'string') {
        try {
            req.body.gallery = JSON.parse(req.body.gallery);
        } catch (e) {
            req.body.gallery = req.body.gallery ? req.body.gallery.split(',').map(g => g.trim()).filter(g => g) : [];
        }
    }
    
    // Parse documents
    if (typeof req.body.documents === 'string') {
        try {
            req.body.documents = JSON.parse(req.body.documents);
        } catch (e) {
            req.body.documents = [];
        }
    }

    // Parse reading time
    if (req.body.readingTime !== undefined) {
        req.body.readingTime = Number(req.body.readingTime) || 3;
    }

    // Handle booleans from FormData (strings -> booleans)
    if (req.body.isPinned !== undefined) req.body.isPinned = req.body.isPinned === 'true';
    if (req.body.isFeatured !== undefined) req.body.isFeatured = req.body.isFeatured === 'true';
    if (req.body.showOnHomepage !== undefined) req.body.showOnHomepage = req.body.showOnHomepage === 'true';
    if (req.body.isUrgent !== undefined) req.body.isUrgent = req.body.isUrgent === 'true';

    if (req.file) {
        req.body.image = req.file.path;
    } else {
        // Remove empty or placeholder fields from body so default schema values apply
        if (req.body.image === '' || req.body.image === 'null') {
            delete req.body.image;
        }
    }

    const publication = await Publication.create(req.body);

    res.status(201).json({
        success: true,
        data: publication
    });
});

// @desc    Update publication
// @route   PUT /api/publications/:id
// @access  Private/Admin
const updatePublication = asyncHandler(async (req, res) => {
    let publication = await Publication.findById(req.params.id);

    if (!publication) {
        res.status(404);
        throw new Error('Publication introuvable');
    }

    // Handle FormData parsing for tags and secondaryCategories (strings -> arrays)
    if (typeof req.body.tags === 'string') {
        req.body.tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    }
    if (typeof req.body.secondaryCategories === 'string') {
        req.body.secondaryCategories = req.body.secondaryCategories ? req.body.secondaryCategories.split(',').map(c => c.trim()).filter(c => c) : [];
    }

    // Parse gallery
    if (typeof req.body.gallery === 'string') {
        try {
            req.body.gallery = JSON.parse(req.body.gallery);
        } catch (e) {
            req.body.gallery = req.body.gallery ? req.body.gallery.split(',').map(g => g.trim()).filter(g => g) : [];
        }
    }
    
    // Parse documents
    if (typeof req.body.documents === 'string') {
        try {
            req.body.documents = JSON.parse(req.body.documents);
        } catch (e) {
            req.body.documents = [];
        }
    }

    // Parse reading time
    if (req.body.readingTime !== undefined) {
        req.body.readingTime = Number(req.body.readingTime) || 3;
    }

    // Handle booleans from FormData (strings -> booleans)
    if (req.body.isPinned !== undefined) req.body.isPinned = req.body.isPinned === 'true';
    if (req.body.isFeatured !== undefined) req.body.isFeatured = req.body.isFeatured === 'true';
    if (req.body.showOnHomepage !== undefined) req.body.showOnHomepage = req.body.showOnHomepage === 'true';
    if (req.body.isUrgent !== undefined) req.body.isUrgent = req.body.isUrgent === 'true';

    if (req.file) {
        // Delete old image if it is a local upload
        if (publication.image) {
            deleteOldImage(publication.image);
        }
        req.body.image = req.file.path;
    } else if (req.body.image === 'null' || req.body.image === '' || req.body.deleteImage === 'true') {
        // User explicitly wants to delete the image
        if (publication.image) {
            deleteOldImage(publication.image);
        }
        req.body.image = '';
    }

    // Update fields manually on document to trigger pre-save slugification hook
    Object.keys(req.body).forEach(key => {
        publication[key] = req.body[key];
    });

    await publication.save();

    res.status(200).json({
        success: true,
        data: publication
    });
});

// @desc    Delete publication
// @route   DELETE /api/publications/:id
// @access  Private/Admin
const deletePublication = asyncHandler(async (req, res) => {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
        res.status(404);
        throw new Error('Publication introuvable');
    }

    // Delete local image if it exists
    if (publication.image) {
        deleteOldImage(publication.image);
    }

    await publication.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getPublications,
    getPublicationById,
    createPublication,
    updatePublication,
    deletePublication
};

